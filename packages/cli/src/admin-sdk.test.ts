import test from 'ava';
import os from 'os';
import path from 'path';
import fse from 'fs-extra';
import { createHash } from 'crypto';
import { importSpace, newSpace, overwriteSpace, swapInStagingDir } from './admin-sdk';
import { WRITE_API_ROOT } from './overwrite';

const GRAPHQL_URL = 'https://cdn.builder.io/api/v2/admin';
const REST_CONTENT_URL = 'https://cdn.builder.io/api/v3/content';

const restContentModel = (url: string) =>
  decodeURIComponent(url.slice(REST_CONTENT_URL.length + 1).split('?')[0]);

const makeSnapshot = async (models: Record<string, { schema: any; entries: any[] }>) => {
  const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-overwrite-test-'));
  for (const [modelName, { schema, entries }] of Object.entries(models)) {
    const modelDir = path.join(dir, modelName);
    await fse.outputJson(path.join(modelDir, 'schema.model.json'), schema);
    for (const entry of entries) {
      await fse.outputJson(path.join(modelDir, `${entry.id || 'no-id'}.json`), entry);
    }
  }
  return dir;
};

/**
 * `createGraphqlClient`'s fetcher and the write-queue's `fetchImpl` both
 * resolve the bare `fetch` identifier at call time, so replacing
 * `global.fetch` intercepts every HTTP call `overwriteSpace` makes —
 * both the GraphQL admin API and the REST content write API.
 */
const withMockedFetch = async (
  handler: (url: string, init: any) => Promise<{ status: number; json?: any; text?: string }>,
  run: () => Promise<void>
) => {
  const calls: Array<{ url: string; init: any }> = [];
  const originalFetch = (global as any).fetch;
  const originalExit = process.exit;
  const originalConsoleError = console.error;
  const errorLogs: string[] = [];
  (global as any).fetch = async (url: string, init: any) => {
    calls.push({ url, init });
    const result = await handler(url, init);
    return {
      ok: result.status >= 200 && result.status < 300,
      status: result.status,
      json: async () => result.json,
      text: async () =>
        result.text !== undefined ? result.text : JSON.stringify(result.json ?? {}),
      headers: { get: () => null },
    };
  };
  let exitCode: number | undefined;
  (process as any).exit = (code?: number) => {
    exitCode = code;
    throw new Error(`process.exit(${code})`);
  };
  console.error = (...args: any[]) => {
    errorLogs.push(args.join(' '));
  };
  try {
    await run();
  } catch (e) {
    if (exitCode === undefined) {
      throw e;
    }
  } finally {
    (global as any).fetch = originalFetch;
    process.exit = originalExit;
    console.error = originalConsoleError;
  }
  return { calls, exitCode, errorLogs };
};

const graphqlResponse = (data: any) => ({ status: 200, json: { data } });

test.serial(
  'prune only deletes entries that predate the run and existed in the destination',
  async t => {
    const dir = await makeSnapshot({
      posts: {
        schema: { name: 'Posts' },
        entries: [{ id: 'a', name: 'A' }],
      },
    });

    const { calls } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('updateModel')) {
            return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
          }
          if (body.query.includes('models')) {
            return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
          }
          return graphqlResponse({ id: 'test-api-key' });
        }
        if (url.startsWith(REST_CONTENT_URL)) {
          const parsed = new URL(url);
          if (Number(parsed.searchParams.get('offset')) > 0) {
            return { status: 200, json: { results: [] } };
          }
          return {
            status: 200,
            json: {
              results: [
                { id: 'a', createdDate: 1 },
                { id: 'stale', createdDate: 1 },
              ],
            },
          };
        }
        if (url.startsWith(WRITE_API_ROOT)) {
          return { status: 200, text: '' };
        }
        throw new Error(`unexpected fetch to ${url}`);
      },
      () => overwriteSpace('fake-key', dir, false, true, true, false)
    );

    const writeUrls = calls
      .filter(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'PUT')
      .map(c => c.url);
    const deleteUrls = calls
      .filter(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'DELETE')
      .map(c => c.url);

    t.true(writeUrls.some(url => url.endsWith('/posts/a')));
    t.true(deleteUrls.some(url => url.endsWith('/posts/stale')));
    t.false(deleteUrls.some(url => url.endsWith('/posts/a')));

    const contentCall = calls.find(c => c.url.startsWith(REST_CONTENT_URL));
    const parsedContentUrl = new URL(contentCall!.url);
    t.is(parsedContentUrl.searchParams.get('includeUnpublished'), 'true');
    t.truthy(parsedContentUrl.searchParams.get('query.createdDate.$lte'));
  }
);

test.serial(
  'prune aborts the whole run instead of mis-pruning when destination content is unreadable',
  async t => {
    // both the draft and published-only REST attempts fail for one model --
    // deciding what is stale in that model is impossible, so the run must
    // fail loudly instead of silently pruning based on an incomplete view
    const dir = await makeSnapshot({
      posts: {
        schema: { name: 'Posts' },
        entries: [{ id: 'a', name: 'A' }],
      },
    });

    const { calls, exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('updateModel')) {
            return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
          }
          if (body.query.includes('models')) {
            return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
          }
          return graphqlResponse({ id: 'test-api-key' });
        }
        if (url.startsWith(REST_CONTENT_URL)) {
          return { status: 403, text: 'forbidden' };
        }
        if (url.startsWith(WRITE_API_ROOT)) {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => overwriteSpace('fake-key', dir, false, true, true, false)
    );

    t.is(exitCode, 1);
    t.true(calls.some(c => c.url.endsWith('/posts/a') && c.init.method === 'PUT'));
    t.false(calls.some(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'DELETE'));
  }
);

test.serial('prune is skipped entirely when a content write fails', async t => {
  const dir = await makeSnapshot({
    posts: {
      schema: { name: 'Posts' },
      entries: [{ id: 'a', name: 'A' }],
    },
  });

  const { calls, exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('updateModel')) {
          return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
        }
        return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
      }
      if (url.startsWith(WRITE_API_ROOT) && init.method === 'PUT') {
        return { status: 400, text: 'bad request' };
      }
      throw new Error(`unexpected fetch to ${url}`);
    },
    () => overwriteSpace('fake-key', dir, false, true, true, false)
  );

  t.is(exitCode, 1);
  t.false(calls.some(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'DELETE'));
});

test.serial('refuses to update a model whose id no longer matches the snapshot', async t => {
  const dir = await makeSnapshot({
    posts: {
      schema: { id: 'original-model-id', name: 'Posts' },
      entries: [{ id: 'a', name: 'A' }],
    },
  });

  const { calls, exitCode, errorLogs } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('updateModel')) {
          // if the mismatch guard were removed, this succeeding response
          // would let the run complete normally instead of failing --
          // proving the failure below is actually caused by the guard
          return graphqlResponse({ updateModel: { id: 'recreated-model-id', name: 'Posts' } });
        }
        return graphqlResponse({ models: [{ id: 'recreated-model-id', name: 'Posts' }] });
      }
      if (url.startsWith(WRITE_API_ROOT)) {
        return { status: 200, text: '' };
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => overwriteSpace('fake-key', dir, false, false, true, false)
  );

  t.is(exitCode, 1);
  t.false(
    calls.some(c => c.url === GRAPHQL_URL && JSON.parse(c.init.body).query.includes('updateModel'))
  );
  t.false(calls.some(c => c.url.startsWith(WRITE_API_ROOT)));
  t.true(errorLogs.some(log => log.includes('does not match the snapshot id')));
});

test.serial(
  'a transient model mutation failure is retried instead of skipping the model',
  async t => {
    const dir = await makeSnapshot({
      posts: {
        schema: { name: 'Posts' },
        entries: [{ id: 'a', name: 'A' }],
      },
    });

    let updateModelCalls = 0;
    const { calls, exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('updateModel')) {
            updateModelCalls++;
            if (updateModelCalls === 1) {
              return { status: 200, json: { errors: [{ message: 'transient error' }] } };
            }
            return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
          }
          return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
        }
        if (url.startsWith(WRITE_API_ROOT)) {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => overwriteSpace('fake-key', dir, false, false, true, false)
    );

    t.is(updateModelCalls, 2);
    t.is(exitCode, undefined);
    t.true(calls.some(c => c.url.endsWith('/posts/a') && c.init.method === 'PUT'));
  }
);

test.serial('dry-run makes no write, delete, or mutation calls', async t => {
  const dir = await makeSnapshot({
    posts: {
      schema: { name: 'Posts' },
      entries: [{ id: 'a', name: 'A' }],
    },
  });

  const { calls } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('models')) {
          return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
        }
        return graphqlResponse({ id: 'test-api-key' });
      }
      if (url.startsWith(REST_CONTENT_URL)) {
        const parsed = new URL(url);
        if (Number(parsed.searchParams.get('offset')) > 0) {
          return { status: 200, json: { results: [] } };
        }
        return { status: 200, json: { results: [{ id: 'a', createdDate: 1 }] } };
      }
      throw new Error(`unexpected mutating fetch to ${url}`);
    },
    () => overwriteSpace('fake-key', dir, false, true, true, true)
  );

  t.false(
    calls.some(c => c.url === GRAPHQL_URL && JSON.parse(c.init.body).query.includes('updateModel'))
  );
  t.false(calls.some(c => c.url.startsWith(WRITE_API_ROOT)));
});

test.serial(
  'refuses to sync a model when two destination models normalize to the same name',
  async t => {
    const dir = await makeSnapshot({
      posts: {
        schema: { name: 'Posts' },
        entries: [{ id: 'a', name: 'A' }],
      },
    });

    const { calls, exitCode, errorLogs } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('updateModel')) {
            return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
          }
          return graphqlResponse({
            models: [
              { id: 'model-1', name: 'Posts' },
              { id: 'model-2', name: 'posts' },
            ],
          });
        }
        if (url.startsWith(WRITE_API_ROOT)) {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => overwriteSpace('fake-key', dir, false, false, true, false)
    );

    t.is(exitCode, 1);
    t.false(
      calls.some(
        c => c.url === GRAPHQL_URL && JSON.parse(c.init.body).query.includes('updateModel')
      )
    );
    t.false(calls.some(c => c.url.startsWith(WRITE_API_ROOT)));
    t.true(errorLogs.some(log => log.includes('not possible to tell which one')));
  }
);

test('swapInStagingDir replaces the target directory only after staging succeeds', async t => {
  const base = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-swap-test-'));
  const directory = path.join(base, 'backup');
  const staging = path.join(base, 'backup.importing-123');

  await fse.outputJson(path.join(directory, 'posts', 'schema.model.json'), { name: 'Posts' });
  await fse.outputJson(path.join(directory, 'posts', 'entry-id-old.json'), { id: 'old' });

  await fse.outputJson(path.join(staging, 'posts', 'schema.model.json'), { name: 'Posts' });
  await fse.outputJson(path.join(staging, 'posts', 'entry-id-new.json'), { id: 'new' });

  await swapInStagingDir(staging, directory);

  t.false(await fse.pathExists(staging));
  t.true(await fse.pathExists(path.join(directory, 'posts', 'entry-id-new.json')));
  t.false(await fse.pathExists(path.join(directory, 'posts', 'entry-id-old.json')));
});

test('swapInStagingDir restores the previous snapshot if the final swap fails', async t => {
  const base = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-swap-test-'));
  const directory = path.join(base, 'backup');
  const missingStaging = path.join(base, 'does-not-exist');

  await fse.outputJson(path.join(directory, 'posts', 'entry-id-old.json'), { id: 'old' });

  await t.throwsAsync(() => swapInStagingDir(missingStaging, directory));

  t.true(await fse.pathExists(path.join(directory, 'posts', 'entry-id-old.json')));
});

test.serial(
  'a transient failure on a graphql query is retried instead of failing the whole run',
  async t => {
    const dir = await makeSnapshot({
      posts: {
        schema: { name: 'Posts' },
        entries: [{ id: 'a', name: 'A' }],
      },
    });

    let modelsQueryCalls = 0;
    const { calls, exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('updateModel')) {
            return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
          }
          modelsQueryCalls++;
          if (modelsQueryCalls === 1) {
            return { status: 503, text: 'upstream unavailable' };
          }
          return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
        }
        if (url.startsWith(WRITE_API_ROOT)) {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => overwriteSpace('fake-key', dir, false, false, true, false)
    );

    t.is(modelsQueryCalls, 2);
    t.is(exitCode, undefined);
    t.true(calls.some(c => c.url.endsWith('/posts/a') && c.init.method === 'PUT'));
  }
);

test.serial('a failing graphql mutation is not automatically retried by the fetcher', async t => {
  const dir = await makeSnapshot({
    posts: {
      schema: { name: 'Posts' },
      entries: [{ id: 'a', name: 'A' }],
    },
  });

  let addModelCalls = 0;
  const { exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('addModel')) {
          addModelCalls++;
          return { status: 503, text: 'upstream unavailable' };
        }
        return graphqlResponse({ models: [] });
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => overwriteSpace('fake-key', dir, false, false, true, false)
  );

  t.is(addModelCalls, 1);
  t.is(exitCode, 1);
});

test.serial(
  'a hidden directory like .git in the snapshot does not cause a false failure or block prune',
  async t => {
    const dir = await makeSnapshot({
      posts: {
        schema: { name: 'Posts' },
        entries: [{ id: 'a', name: 'A' }],
      },
    });
    // simulates the snapshot directory being version-controlled, or just
    // browsed on macOS (.DS_Store) -- neither should be mistaken for a model
    await fse.ensureDir(path.join(dir, '.git'));
    await fse.outputFile(path.join(dir, 'posts', '.DS_Store'), 'junk');

    const { calls, exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('updateModel')) {
            return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
          }
          if (body.query.includes('models')) {
            return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
          }
          return graphqlResponse({ id: 'test-api-key' });
        }
        if (url.startsWith(REST_CONTENT_URL)) {
          const parsed = new URL(url);
          if (Number(parsed.searchParams.get('offset')) > 0) {
            return { status: 200, json: { results: [] } };
          }
          return { status: 200, json: { results: [{ id: 'a', createdDate: 1 }] } };
        }
        if (url.startsWith(WRITE_API_ROOT)) {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => overwriteSpace('fake-key', dir, false, true, true, false)
    );

    t.is(exitCode, undefined);
    t.true(calls.some(c => c.url.endsWith('/posts/a') && c.init.method === 'PUT'));
    t.false(calls.some(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'DELETE'));
  }
);

test('swapInStagingDir handles a trailing slash on the output directory', async t => {
  const base = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-swap-slash-test-'));
  // a trailing slash (e.g. from `-o ./backup/`) would otherwise make plain
  // string concatenation build a sibling path *inside* the directory itself
  const directory = path.join(base, 'backup') + path.sep;
  const stagingDir = path.join(base, 'backup') + '.importing-123';

  await fse.outputJson(path.join(directory, 'posts', 'entry-id-old.json'), { id: 'old' });
  await fse.outputJson(path.join(stagingDir, 'posts', 'entry-id-new.json'), { id: 'new' });

  await swapInStagingDir(stagingDir, directory);

  const finalDir = path.join(base, 'backup');
  t.false(await fse.pathExists(stagingDir));
  t.true(await fse.pathExists(path.join(finalDir, 'posts', 'entry-id-new.json')));
  t.false(await fse.pathExists(path.join(finalDir, 'posts', 'entry-id-old.json')));
});

test.serial('importSpace refuses to replace a directory containing unrelated files', async t => {
  const base = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-import-guard-test-'));
  await fse.outputFile(path.join(base, 'my-important-file.txt'), 'keep me');

  const { exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (!body.query.includes('content(')) {
          return graphqlResponse({ settings: { name: 'Test' } });
        }
        const vars = Object.values(body.variables)[0] as any;
        if (vars.offset > 0) {
          return graphqlResponse({ models: [] });
        }
        return graphqlResponse({
          models: [
            {
              id: 'model-1',
              name: 'Posts',
              everything: { name: 'Posts' },
              content: [{ id: 'a', createdDate: 1 }],
            },
          ],
        });
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => importSpace('fake-key', base, false, 100)
  );

  t.is(exitCode, 1);
  // the guard runs after the (read-only) download but before any write,
  // so the unrelated file is never touched
  t.true(await fse.pathExists(path.join(base, 'my-important-file.txt')));
  t.false(await fse.pathExists(path.join(base, 'posts')));
});

test.serial('importSpace refuses a model dir that only coincidentally has a schema.model.json', async t => {
  const base = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-import-guard-json-test-'));
  await fse.outputJson(path.join(base, 'not-a-model', 'schema.model.json'), { name: 'Posts' });
  await fse.outputFile(path.join(base, 'not-a-model', 'notes.txt'), 'unrelated data');

  const { exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (!body.query.includes('content(')) {
          return graphqlResponse({ settings: { name: 'Test' } });
        }
        const vars = Object.values(body.variables)[0] as any;
        if (vars.offset > 0) {
          return graphqlResponse({ models: [] });
        }
        return graphqlResponse({
          models: [
            {
              id: 'model-1',
              name: 'Posts',
              everything: { name: 'Posts' },
              content: [{ id: 'a', createdDate: 1 }],
            },
          ],
        });
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => importSpace('fake-key', base, false, 100)
  );

  t.is(exitCode, 1);
  t.true(await fse.pathExists(path.join(base, 'not-a-model', 'notes.txt')));
});

test.serial(
  'importSpace restores a snapshot left over from a crash mid-swap, and cleans up stale staging dirs',
  async t => {
    const base = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-import-recovery-test-'));
    const directory = path.join(base, 'backup');
    const previousDir = path.join(base, 'backup.previous-1000');
    await fse.outputJson(path.join(previousDir, 'settings.json'), { name: 'Old' });
    await fse.outputJson(path.join(previousDir, 'posts', 'schema.model.json'), { name: 'Posts' });
    await fse.outputJson(path.join(previousDir, 'posts', 'entry-id-old.json'), { id: 'old' });
    const staleStagingDir = path.join(base, 'backup.importing-9999-1');
    await fse.outputFile(path.join(staleStagingDir, 'posts', 'schema.model.json'), 'incomplete');

    const { exitCode } = await withMockedFetch(
      async () => {
        throw new Error('network error');
      },
      () => importSpace('fake-key', directory, false, 100)
    );

    t.is(exitCode, 1);
    t.true(await fse.pathExists(path.join(directory, 'settings.json')));
    t.true(await fse.pathExists(path.join(directory, 'posts', 'entry-id-old.json')));
    t.false(await fse.pathExists(previousDir));
    t.false(await fse.pathExists(staleStagingDir));
  }
);

test.serial('importSpace allows re-importing into its own prior snapshot', async t => {
  const base = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-import-reimport-test-'));
  const dir = path.join(base, 'backup');
  await fse.outputJson(path.join(dir, 'settings.json'), { name: 'Old' });
  await fse.outputJson(path.join(dir, 'posts', 'schema.model.json'), { name: 'Posts' });
  await fse.outputJson(path.join(dir, 'posts', 'entry-id-old.json'), { id: 'old' });

  const { exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('settings')) {
          return graphqlResponse({ settings: { name: 'New' } });
        }
        if (!body.query.includes('content(')) {
          return graphqlResponse({ id: 'test-api-key' });
        }
        const vars = Object.values(body.variables)[0] as any;
        if (vars.offset > 0) {
          return graphqlResponse({ models: [] });
        }
        return graphqlResponse({
          models: [
            {
              id: 'model-1',
              name: 'Posts',
              everything: { name: 'Posts' },
              content: [{ id: 'a', createdDate: 1 }],
            },
          ],
        });
      }
      if (url.startsWith(REST_CONTENT_URL)) {
        return { status: 200, json: { results: [] } };
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => importSpace('fake-key', dir, false, 100)
  );

  t.is(exitCode, undefined);
  t.true(await fse.pathExists(path.join(dir, 'posts', 'entry-id-a.json')));
  t.false(await fse.pathExists(path.join(dir, 'posts', 'entry-id-old.json')));
});

test.serial('importSpace requests unpublished/draft content, not just published', async t => {
  const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-import-drafts-test-'));

  const { calls, exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('settings')) {
          return graphqlResponse({ settings: { name: 'Test' } });
        }
        if (body.query.includes('models')) {
          return graphqlResponse({
            models: [{ id: 'model-1', name: 'Posts', everything: { name: 'Posts' } }],
          });
        }
        return graphqlResponse({ id: 'test-api-key' });
      }
      if (url.startsWith(REST_CONTENT_URL)) {
        const parsed = new URL(url);
        if (Number(parsed.searchParams.get('offset')) > 0) {
          return { status: 200, json: { results: [] } };
        }
        return {
          status: 200,
          json: { results: [{ id: 'draft-a', createdDate: 1, published: 'draft' }] },
        };
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => importSpace('fake-key', dir, false, 100, true)
  );

  t.is(exitCode, undefined);
  t.true(await fse.pathExists(path.join(dir, 'posts', 'entry-id-draft-a.json')));

  const contentCall = calls.find(c => c.url.startsWith(REST_CONTENT_URL));
  const parsedContentUrl = new URL(contentCall!.url);
  t.is(parsedContentUrl.searchParams.get('includeUnpublished'), 'true');
});

test.serial(
  'importSpace merges priority into a snapshot entry even though the content endpoint omits it by default',
  async t => {
    // confirmed against a real space: the v3 content REST endpoint's
    // default field set silently omits `priority`, and `fields` is a
    // projection that replaces rather than extends that default set -- so
    // fetchModelContentPageRest issues a second, narrow request for just
    // id/priority and merges it back into the full entry by id
    const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-import-priority-test-'));

    const { exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('settings')) {
            return graphqlResponse({ settings: { name: 'Test' } });
          }
          if (body.query.includes('models')) {
            return graphqlResponse({
              models: [{ id: 'model-1', name: 'Posts', everything: { name: 'Posts' } }],
            });
          }
          return graphqlResponse({ id: 'test-api-key' });
        }
        if (url.startsWith(REST_CONTENT_URL)) {
          const parsed = new URL(url);
          if (Number(parsed.searchParams.get('offset')) > 0) {
            return { status: 200, json: { results: [] } };
          }
          if (parsed.searchParams.get('fields') === 'id,priority') {
            return { status: 200, json: { results: [{ id: 'a', priority: -12.5 }] } };
          }
          return {
            status: 200,
            json: { results: [{ id: 'a', name: 'A', createdDate: 1 }] },
          };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => importSpace('fake-key', dir, false, 100, true)
    );

    t.is(exitCode, undefined);
    const entry = await fse.readJson(path.join(dir, 'posts', 'entry-id-a.json'));
    t.is(entry.priority, -12.5);
    t.is(entry.name, 'A');
  }
);

test.serial(
  'newSpace remaps a snapshot own ids into the new org without relying on cloneInfo',
  async t => {
    const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-create-test-'));
    await fse.outputJson(path.join(dir, 'settings.json'), { id: 'old-space-id', name: 'Old' });
    await fse.outputJson(path.join(dir, 'posts', 'schema.model.json'), {
      id: 'model-1',
      name: 'Posts',
    });
    // references its own model by id, the same way a relationship/symbol
    // field would -- proving the reference gets remapped too, not just the
    // entry own top-level id
    await fse.outputJson(path.join(dir, 'posts', 'entry-id-entry-1.json'), {
      id: 'entry-1',
      name: 'A',
      relatedModelId: 'model-1',
    });

    const expectedContentId = createHash('sha256')
      .update('entry-1new-org-id')
      .digest('hex');

    const { calls, exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('createSpace')) {
            return graphqlResponse({
              createSpace: {
                organization: { id: 'new-org-id', name: 'New' },
                privateKey: { key: 'new-space-key' },
              },
            });
          }
          if (body.query.includes('addModel')) {
            return graphqlResponse({ addModel: { id: 'new-model-id', name: 'Posts' } });
          }
          throw new Error('unexpected graphql query: ' + body.query);
        }
        if (url.startsWith(WRITE_API_ROOT)) {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => newSpace('fake-key', dir, 'New', false)
    );

    t.is(exitCode, undefined);

    const addModelCall = calls.find(
      c => c.url === GRAPHQL_URL && JSON.parse(c.init.body).query.includes('addModel')
    );
    const addModelBody = Object.values(JSON.parse(addModelCall!.init.body).variables)[0] as any;
    t.not(addModelBody.id, 'model-1');

    const writeCall = calls.find(c => c.url.startsWith(WRITE_API_ROOT));
    // content is created via POST to the collection, not PUT-by-id: the new
    // space starts empty, and PUT-by-id 404s instead of creating when the
    // entry doesn't already exist
    t.is(writeCall!.init.method, 'POST');
    t.true(writeCall!.url.endsWith('/posts'));
    const writtenEntry = JSON.parse(writeCall!.init.body);
    t.is(writtenEntry.id, expectedContentId);
    // the reference to the model id embedded in the entry got remapped to
    // the same new id addModel was called with, not left pointing at the
    // old space model id
    t.is(writtenEntry.relatedModelId, addModelBody.id);
  }
);

test.serial('newSpace derives a stable id for entries that have none', async t => {
  const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-create-noid-test-'));
  await fse.outputJson(path.join(dir, 'settings.json'), { id: 'old-space-id', name: 'Old' });
  await fse.outputJson(path.join(dir, 'posts', 'schema.model.json'), {
    id: 'model-1',
    name: 'Posts',
  });
  await fse.outputJson(path.join(dir, 'posts', 'entry-noid-0.json'), { name: 'A' });

  const { calls, exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('createSpace')) {
          return graphqlResponse({
            createSpace: {
              organization: { id: 'new-org-id', name: 'New' },
              privateKey: { key: 'new-space-key' },
            },
          });
        }
        if (body.query.includes('addModel')) {
          return graphqlResponse({ addModel: { id: 'new-model-id', name: 'Posts' } });
        }
        throw new Error('unexpected graphql query: ' + body.query);
      }
      if (url.startsWith(WRITE_API_ROOT)) {
        return { status: 200, text: '' };
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => newSpace('fake-key', dir, 'New', false)
  );

  t.is(exitCode, undefined);

  const writeCall = calls.find(c => c.url.startsWith(WRITE_API_ROOT));
  const writtenEntry = JSON.parse(writeCall!.init.body);
  // an id-less entry POSTed without an id would create a duplicate on
  // retry after a lost response -- it must be given a stable id derived
  // from its file, the same way overwriteSpace already does
  t.is(typeof writtenEntry.id, 'string');
  t.truthy(writtenEntry.id);
});

test.serial(
  'newSpace creates entries in their original createdDate order, not file-listing order',
  async t => {
    // Builder decides which entry wins when several target the same
    // URL/conditions by their position in the model's entry list -- there
    // is no field for this, so create has to reproduce it by writing
    // entries in their original relative order. Filenames are
    // entry-id-<id>.json, so alphabetical directory-listing order does
    // not match creation order -- these ids are deliberately chosen so
    // alphabetical order is the reverse of createdDate order
    const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-create-order-test-'));
    await fse.outputJson(path.join(dir, 'settings.json'), { id: 'old-space-id', name: 'Old' });
    await fse.outputJson(path.join(dir, 'posts', 'schema.model.json'), { name: 'Posts' });
    await fse.outputJson(path.join(dir, 'posts', 'entry-id-z-newest.json'), {
      id: 'z-newest',
      name: 'Newest',
      createdDate: 3000,
    });
    await fse.outputJson(path.join(dir, 'posts', 'entry-id-y-middle.json'), {
      id: 'y-middle',
      name: 'Middle',
      createdDate: 2000,
    });
    await fse.outputJson(path.join(dir, 'posts', 'entry-id-x-oldest.json'), {
      id: 'x-oldest',
      name: 'Oldest',
      createdDate: 1000,
    });

    const { calls, exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('createSpace')) {
            return graphqlResponse({
              createSpace: {
                organization: { id: 'new-org-id', name: 'New' },
                privateKey: { key: 'new-space-key' },
              },
            });
          }
          if (body.query.includes('addModel')) {
            return graphqlResponse({ addModel: { id: 'new-model-id', name: 'Posts' } });
          }
          throw new Error('unexpected graphql query: ' + body.query);
        }
        if (url.startsWith(WRITE_API_ROOT)) {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => newSpace('fake-key', dir, 'New', false)
    );

    t.is(exitCode, undefined);
    const writeCalls = calls.filter(c => c.url.startsWith(WRITE_API_ROOT));
    t.deepEqual(
      writeCalls.map(c => JSON.parse(c.init.body).name),
      ['Oldest', 'Middle', 'Newest']
    );
  }
);

test.serial('overwrite falls back to POST when PUT-by-id 404s on a missing entry', async t => {
  const dir = await makeSnapshot({
    posts: { schema: { name: 'Posts' }, entries: [{ id: 'missing-in-target', name: 'A' }] },
  });

  const { calls, exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('updateModel')) {
          return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
        }
        return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
      }
      if (url.startsWith(WRITE_API_ROOT) && init.method === 'PUT') {
        return { status: 404, text: 'not found' };
      }
      if (url.startsWith(WRITE_API_ROOT) && init.method === 'POST') {
        return { status: 200, text: '' };
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => overwriteSpace('fake-key', dir, false, false, true, false)
  );

  t.is(exitCode, undefined);
  const putCall = calls.find(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'PUT');
  const postCall = calls.find(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'POST');
  t.truthy(putCall);
  t.truthy(postCall);
  t.true(Boolean(putCall && putCall.url.endsWith('/posts/missing-in-target')));
  t.true(Boolean(postCall && postCall.url.endsWith('/posts')));
  t.is(postCall && JSON.parse(postCall.init.body).id, 'missing-in-target');
});

test.serial(
  'overwrite writes new entries in their original createdDate order, not file-listing order',
  async t => {
    // same ordering guarantee as create, exercised through overwrite's
    // POST-fallback path for entries missing from the target -- ids are
    // chosen so alphabetical (file-listing) order is the reverse of
    // createdDate order
    const dir = await makeSnapshot({
      posts: {
        schema: { name: 'Posts' },
        entries: [
          { id: 'z-newest', name: 'Newest', createdDate: 3000 },
          { id: 'y-middle', name: 'Middle', createdDate: 2000 },
          { id: 'x-oldest', name: 'Oldest', createdDate: 1000 },
        ],
      },
    });

    const { calls, exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('updateModel')) {
            return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
          }
          return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
        }
        if (url.startsWith(WRITE_API_ROOT) && init.method === 'PUT') {
          return { status: 404, text: 'not found' };
        }
        if (url.startsWith(WRITE_API_ROOT) && init.method === 'POST') {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => overwriteSpace('fake-key', dir, false, false, true, false)
    );

    t.is(exitCode, undefined);
    const postCalls = calls.filter(
      c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'POST'
    );
    t.deepEqual(
      postCalls.map(c => JSON.parse(c.init.body).id),
      ['x-oldest', 'y-middle', 'z-newest']
    );
  }
);

test.serial(
  'overwrite restores an entry\'s original priority with a follow-up PATCH after creating it',
  async t => {
    // a plain create doesn't reliably store `priority` -- confirmed against
    // a real space, where entries created via POST ended up with
    // server-assigned priorities unrelated to the ones sent in the request.
    // overwrite's POST-fallback path (for entries missing from the target)
    // needs the same follow-up PATCH `newSpace` uses to actually fix that.
    const dir = await makeSnapshot({
      posts: {
        schema: { name: 'Posts' },
        entries: [{ id: 'missing-in-target', name: 'A', priority: -12.5 }],
      },
    });

    const { calls, exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('updateModel')) {
            return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
          }
          return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
        }
        if (url.startsWith(WRITE_API_ROOT) && init.method === 'PUT') {
          return { status: 404, text: 'not found' };
        }
        if (url.startsWith(WRITE_API_ROOT) && (init.method === 'POST' || init.method === 'PATCH')) {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => overwriteSpace('fake-key', dir, false, false, true, false)
    );

    t.is(exitCode, undefined);
    const patchCall = calls.find(
      c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'PATCH'
    );
    t.truthy(patchCall);
    t.true(Boolean(patchCall && patchCall.url.endsWith('/posts/missing-in-target')));
    t.deepEqual(patchCall && JSON.parse(patchCall.init.body), { priority: -12.5 });
  }
);

test.serial(
  'newSpace orders entries by their own priority field, not createdDate, when both are present',
  async t => {
    // priority is the field Builder's UI list order (and therefore delivery
    // priority) is actually based on; createdDate is only a fallback for
    // entries missing it. createdDate here is deliberately the reverse of
    // priority order to prove priority wins.
    const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-create-priority-order-test-'));
    await fse.outputJson(path.join(dir, 'settings.json'), { id: 'old-space-id', name: 'Old' });
    await fse.outputJson(path.join(dir, 'posts', 'schema.model.json'), { name: 'Posts' });
    await fse.outputJson(path.join(dir, 'posts', 'low-priority.json'), {
      id: 'low-priority',
      name: 'Low',
      priority: 10,
      createdDate: 1000,
    });
    await fse.outputJson(path.join(dir, 'posts', 'mid-priority.json'), {
      id: 'mid-priority',
      name: 'Mid',
      priority: 0,
      createdDate: 2000,
    });
    await fse.outputJson(path.join(dir, 'posts', 'high-priority.json'), {
      id: 'high-priority',
      name: 'High',
      priority: -5,
      createdDate: 3000,
    });

    const { calls, exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('createSpace')) {
            return graphqlResponse({
              createSpace: {
                organization: { id: 'new-org-id', name: 'New' },
                privateKey: { key: 'new-space-key' },
              },
            });
          }
          if (body.query.includes('addModel')) {
            return graphqlResponse({ addModel: { id: 'new-model-id', name: 'Posts' } });
          }
          throw new Error('unexpected graphql query: ' + body.query);
        }
        if (url.startsWith(WRITE_API_ROOT)) {
          return { status: 200, text: '' };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => newSpace('fake-key', dir, 'New', false)
    );

    t.is(exitCode, undefined);
    const writeCalls = calls.filter(
      c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'POST'
    );
    t.deepEqual(
      writeCalls.map(c => JSON.parse(c.init.body).name),
      ['High', 'Mid', 'Low']
    );

    // ids are rehashed by newSpace's replaceIds, so entries can only be
    // matched up between the create (POST) and priority-restore (PATCH)
    // calls by that shared, already-rehashed id
    const priorityByPostedId = new Map(
      writeCalls.map(c => {
        const body = JSON.parse(c.init.body);
        return [body.id, body.priority];
      })
    );
    const patchCalls = calls.filter(
      c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'PATCH'
    );
    const priorityByPatchedId = new Map(
      patchCalls.map(c => [c.url.split('/').pop(), JSON.parse(c.init.body).priority])
    );
    t.deepEqual(priorityByPatchedId, priorityByPostedId);
  }
);

test.serial(
  'importSpace falls back to published-only content for a model whose drafts the server rejects',
  async t => {
    // reproduces the real production error: the v3 content REST endpoint
    // can reject a specific model's draft request (a 404 resolving that
    // model's unpublished content) -- the import must still succeed, with
    // that one model published-only, instead of losing drafts for every
    // other model too (as the old shared-batched-query approach did)
    const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-import-fallback-test-'));

    let draftAttempts = 0;
    const { exitCode } = await withMockedFetch(
      async (url, init) => {
        if (url === GRAPHQL_URL) {
          const body = JSON.parse(init.body);
          if (body.query.includes('settings')) {
            return graphqlResponse({ settings: { name: 'Test' } });
          }
          if (body.query.includes('models')) {
            return graphqlResponse({
              models: [{ id: 'model-1', name: 'Posts', everything: { name: 'Posts' } }],
            });
          }
          return graphqlResponse({ id: 'test-api-key' });
        }
        if (url.startsWith(REST_CONTENT_URL)) {
          const parsed = new URL(url);
          if (parsed.searchParams.get('includeUnpublished') === 'true') {
            draftAttempts++;
            return { status: 404, text: 'not found' };
          }
          if (Number(parsed.searchParams.get('offset')) > 0) {
            return { status: 200, json: { results: [] } };
          }
          return { status: 200, json: { results: [{ id: 'published-only', createdDate: 1 }] } };
        }
        throw new Error('unexpected fetch to ' + url);
      },
      () => importSpace('fake-key', dir, false, 100, true)
    );

    t.is(exitCode, undefined);
    t.is(draftAttempts, 1);
    t.true(await fse.pathExists(path.join(dir, 'posts', 'entry-id-published-only.json')));
  }
);

test.serial(
  'importSpace names the model whose drafts it could not fetch, without affecting other models',
  async t => {
    const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-import-named-fallback-test-'));
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.join(' '));
    };

    try {
      await withMockedFetch(
        async (url, init) => {
          if (url === GRAPHQL_URL) {
            const body = JSON.parse(init.body);
            if (body.query.includes('settings')) {
              return graphqlResponse({ settings: { name: 'Test' } });
            }
            if (body.query.includes('models')) {
              return graphqlResponse({
                models: [
                  { id: 'model-1', name: 'authors', everything: { name: 'authors' } },
                  { id: 'model-2', name: 'posts', everything: { name: 'posts' } },
                ],
              });
            }
            return graphqlResponse({ id: 'test-api-key' });
          }
          if (url.startsWith(REST_CONTENT_URL)) {
            const parsed = new URL(url);
            const modelName = restContentModel(url);
            if (modelName === 'authors' && parsed.searchParams.get('includeUnpublished') === 'true') {
              return { status: 404, text: 'not found' };
            }
            if (Number(parsed.searchParams.get('offset')) > 0) {
              return { status: 200, json: { results: [] } };
            }
            return { status: 200, json: { results: [{ id: `${modelName}-entry`, createdDate: 1 }] } };
          }
          throw new Error('unexpected fetch to ' + url);
        },
        () => importSpace('fake-key', dir, false, 100, true)
      );
    } finally {
      console.log = originalLog;
    }

    t.true(logs.some(line => line.includes('"authors"')));
    t.false(logs.some(line => line.includes('Could not fetch') && line.includes('"posts"')));
  }
);
