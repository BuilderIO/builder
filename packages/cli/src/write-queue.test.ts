import test from 'ava';
import { FetchLike, mapWithConcurrency, postJsonWithRetry } from './write-queue';

const response = (status: number, body = '', headers: Record<string, string> = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => body,
  headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
});

const noSleep = async () => {};

test('mapWithConcurrency never exceeds the pool size', async t => {
  let inFlight = 0;
  let peak = 0;
  const items = Array.from({ length: 50 }, (_, i) => i);

  const results = await mapWithConcurrency(items, 5, async item => {
    inFlight++;
    peak = Math.max(peak, inFlight);
    await new Promise(resolve => setTimeout(resolve, 1));
    inFlight--;
    return item * 2;
  });

  t.is(peak, 5);
  t.deepEqual(results, items.map(item => item * 2));
});

test('mapWithConcurrency preserves result order', async t => {
  const items = ['a', 'b', 'c', 'd'];
  const results = await mapWithConcurrency(items, 3, async (item, index) => {
    await new Promise(resolve => setTimeout(resolve, (items.length - index) * 2));
    return `${index}:${item}`;
  });

  t.deepEqual(results, ['0:a', '1:b', '2:c', '3:d']);
});

test('mapWithConcurrency handles an empty list', async t => {
  const results = await mapWithConcurrency([], 5, async () => 'nope');
  t.deepEqual(results, []);
});

test('a successful write resolves without retrying', async t => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => {
    calls++;
    return response(200, '{}');
  };

  await postJsonWithRetry({ fetchImpl, url: 'https://example.com', body: {}, sleep: noSleep });
  t.is(calls, 1);
});

test('retries rate limited writes and then succeeds', async t => {
  const statuses = [429, 503, 200];
  let calls = 0;
  const fetchImpl: FetchLike = async () => response(statuses[calls++]);

  await postJsonWithRetry({ fetchImpl, url: 'https://example.com', body: {}, sleep: noSleep });
  t.is(calls, 3);
});

test('honours the retry-after header', async t => {
  const delays: number[] = [];
  let calls = 0;
  const fetchImpl: FetchLike = async () =>
    calls++ === 0 ? response(429, '', { 'retry-after': '2' }) : response(200);

  await postJsonWithRetry({
    fetchImpl,
    url: 'https://example.com',
    body: {},
    sleep: async ms => {
      delays.push(ms);
    },
  });

  t.deepEqual(delays, [2000]);
});

test('honours an http-date retry-after header', async t => {
  const delays: number[] = [];
  let calls = 0;
  const retryAt = new Date(Date.now() + 3000);
  const fetchImpl: FetchLike = async () =>
    calls++ === 0 ? response(429, '', { 'retry-after': retryAt.toUTCString() }) : response(200);

  await postJsonWithRetry({
    fetchImpl,
    url: 'https://example.com',
    body: {},
    sleep: async ms => {
      delays.push(ms);
    },
  });

  t.is(delays.length, 1);
  t.true(delays[0] > 0 && delays[0] <= 3000);
});

test('throws after exhausting retries so failures are never silent', async t => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => {
    calls++;
    return response(500, 'server exploded');
  };

  const error = await t.throwsAsync(
    postJsonWithRetry({
      fetchImpl,
      url: 'https://example.com',
      body: {},
      retries: 2,
      sleep: noSleep,
    })
  );

  t.is(calls, 3);
  t.true(error.message.includes('500'));
  t.true(error.message.includes('server exploded'));
});

test('a retried DELETE that 404s is treated as already-deleted success', async t => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => {
    calls++;
    if (calls === 1) {
      throw new Error('network blip');
    }
    return response(404, 'not found');
  };

  const result = await postJsonWithRetry({
    fetchImpl,
    url: 'https://example.com',
    method: 'DELETE',
    sleep: noSleep,
  });

  t.is(calls, 2);
  t.true(result.ok);
});

test('a first-attempt 404 on DELETE is still a failure', async t => {
  const fetchImpl: FetchLike = async () => response(404, 'not found');

  const error = await t.throwsAsync(
    postJsonWithRetry({ fetchImpl, url: 'https://example.com', method: 'DELETE', sleep: noSleep })
  );

  t.true(error.message.includes('404'));
});

test('the success response body stays readable after the request settles', async t => {
  const fetchImpl: FetchLike = async () => response(200, JSON.stringify({ id: 'abc' }));

  const result = await postJsonWithRetry({
    fetchImpl,
    url: 'https://example.com',
    body: {},
    sleep: noSleep,
  });

  t.deepEqual(JSON.parse(await result.text()), { id: 'abc' });
});

test('does not retry client errors', async t => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => {
    calls++;
    return response(400, 'bad payload');
  };

  const error = await t.throwsAsync(
    postJsonWithRetry({ fetchImpl, url: 'https://example.com', body: {}, sleep: noSleep })
  );

  t.is(calls, 1);
  t.true(error.message.includes('400'));
});

test('retries network errors', async t => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => {
    calls++;
    if (calls < 3) {
      throw new Error('ECONNRESET');
    }
    return response(200);
  };

  await postJsonWithRetry({ fetchImpl, url: 'https://example.com', body: {}, sleep: noSleep });
  t.is(calls, 3);
});

test('sends the payload as json with the provided headers', async t => {
  let seenUrl = '';
  let seenInit: any;
  const fetchImpl: FetchLike = async (url, init) => {
    seenUrl = url;
    seenInit = init;
    return response(200);
  };

  await postJsonWithRetry({
    fetchImpl,
    url: 'https://builder.io/api/v1/write/page',
    body: { name: 'home' },
    headers: { Authorization: 'Bearer key' },
    sleep: noSleep,
  });

  t.is(seenUrl, 'https://builder.io/api/v1/write/page');
  t.is(seenInit.method, 'POST');
  t.is(seenInit.body, JSON.stringify({ name: 'home' }));
  t.is(seenInit.headers['Content-Type'], 'application/json');
  t.is(seenInit.headers.Authorization, 'Bearer key');
});

test('a stalled request is aborted once the timeout elapses', async t => {
  let calls = 0;
  const fetchImpl: FetchLike = (_url, init) =>
    new Promise((_resolve, reject) => {
      calls++;
      init.signal.addEventListener('abort', () => reject(new Error('The operation was aborted')));
    });

  const error = await t.throwsAsync(
    postJsonWithRetry({
      fetchImpl,
      url: 'https://example.com',
      body: {},
      retries: 0,
      timeoutMs: 10,
      sleep: noSleep,
    })
  );

  t.is(calls, 1);
  t.true(error.message.includes('aborted'));
});

test('a stalled response body is aborted once the timeout elapses', async t => {
  let calls = 0;
  const fetchImpl: FetchLike = (_url, init) => {
    calls++;
    return Promise.resolve({
      ok: false,
      status: 500,
      headers: { get: () => null },
      text: () =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(new Error('The operation was aborted')));
        }),
    });
  };

  const error = await t.throwsAsync(
    postJsonWithRetry({
      fetchImpl,
      url: 'https://example.com',
      body: {},
      retries: 0,
      timeoutMs: 10,
      sleep: noSleep,
    })
  );

  t.is(calls, 1);
  t.true(error.message.includes('500'));
});

test('retries: 0 fails on the first retriable failure instead of retrying', async t => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => {
    calls++;
    return response(500, 'boom');
  };

  await t.throwsAsync(
    postJsonWithRetry({ fetchImpl, url: 'https://example.com', body: {}, retries: 0, sleep: noSleep })
  );

  t.is(calls, 1);
});

test('defaults to POST but sends PUT when requested', async t => {
  const methods: string[] = [];
  const fetchImpl: FetchLike = async (_url, init) => {
    methods.push(init.method);
    return response(200);
  };

  await postJsonWithRetry({ fetchImpl, url: 'https://example.com', body: {}, sleep: noSleep });
  await postJsonWithRetry({
    fetchImpl,
    url: 'https://example.com',
    body: {},
    method: 'PUT',
    sleep: noSleep,
  });

  t.deepEqual(methods, ['POST', 'PUT']);
});
