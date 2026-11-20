import { fetchWithLogging, getDefaultLogLevel } from './log-level.function';

describe('getDefaultLogLevel', () => {
  const originalEnv = process.env.BUILDER_SDK_LOG_LEVEL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.BUILDER_SDK_LOG_LEVEL;
    } else {
      process.env.BUILDER_SDK_LOG_LEVEL = originalEnv;
    }
  });

  test('defaults to silent when unset or unrecognized', () => {
    delete process.env.BUILDER_SDK_LOG_LEVEL;
    expect(getDefaultLogLevel()).toBe('silent');

    process.env.BUILDER_SDK_LOG_LEVEL = 'verbose';
    expect(getDefaultLogLevel()).toBe('silent');
  });

  test.each(['error', 'WARN', 'Info', 'debug', ' silent '])(
    'parses %s case-insensitively',
    raw => {
      process.env.BUILDER_SDK_LOG_LEVEL = raw;
      expect(getDefaultLogLevel()).toBe(raw.trim().toLowerCase());
    }
  );
});

describe('fetchWithLogging', () => {
  const url = 'https://cdn.builder.io/api/v3/content/page';
  let spies: Record<'error' | 'warn' | 'info' | 'debug', jest.SpyInstance>;

  beforeEach(() => {
    spies = {
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      info: jest.spyOn(console, 'info').mockImplementation(() => {}),
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    Object.keys(spies).forEach(k => spies[k as keyof typeof spies].mockRestore());
  });

  const mockFetch = (status: number, requestId: string | null = 'req-123') =>
    jest.fn().mockResolvedValue({
      status,
      headers: {
        get: (name: string) => (name === 'x-request-id' ? requestId : null),
        forEach: (cb: (value: string, key: string) => void) => {
          if (requestId) {
            cb(requestId, 'x-request-id');
          }
          cb('HIT', 'x-cache');
        },
      },
    });

  test('silent logs nothing', async () => {
    await fetchWithLogging(mockFetch(500), 'silent', url);
    expect(spies.error).not.toHaveBeenCalled();
    expect(spies.debug).not.toHaveBeenCalled();
  });

  test('error logs 5xx and network rejections via console.error, ignoring 2xx and 4xx', async () => {
    await fetchWithLogging(mockFetch(200), 'error', url);
    await fetchWithLogging(mockFetch(404), 'error', url);
    expect(spies.error).not.toHaveBeenCalled();
    expect(spies.warn).not.toHaveBeenCalled();

    await fetchWithLogging(mockFetch(503, 'req-503'), 'error', url);
    expect(spies.error).toHaveBeenCalledTimes(1);
    expect(spies.error.mock.calls[0][0]).toEqual(expect.stringContaining('503'));
    expect(spies.error.mock.calls[0][0]).toEqual(expect.stringContaining('req-503'));

    const err = new Error('ECONNRESET');
    await expect(
      fetchWithLogging(jest.fn().mockRejectedValue(err), 'error', url)
    ).rejects.toThrow('ECONNRESET');
    expect(spies.error).toHaveBeenCalledTimes(2);
    expect(spies.error.mock.calls[1][1]).toBe(err);
  });

  test('warn logs 4xx via console.warn and 5xx via console.error, ignoring 2xx', async () => {
    await fetchWithLogging(mockFetch(200), 'warn', url);
    await fetchWithLogging(mockFetch(429, 'req-429'), 'warn', url);
    await fetchWithLogging(mockFetch(500, 'req-500'), 'warn', url);

    expect(spies.info).not.toHaveBeenCalled();
    expect(spies.warn).toHaveBeenCalledTimes(1);
    expect(spies.warn.mock.calls[0][0]).toContain('req-429');
    expect(spies.error).toHaveBeenCalledTimes(1);
    expect(spies.error.mock.calls[0][0]).toContain('req-500');
  });

  test('info logs 2xx one-line summary via console.info without debug header dumps', async () => {
    await fetchWithLogging(mockFetch(200, 'req-ok'), 'info', url);

    expect(spies.info).toHaveBeenCalledTimes(1);
    expect(spies.info.mock.calls[0][0]).toContain(url);
    expect(spies.info.mock.calls[0][0]).toContain('req-ok');
    expect(spies.debug).not.toHaveBeenCalled();
  });

  test('debug logs request and response headers with sensitive headers redacted', async () => {
    await fetchWithLogging(mockFetch(200, 'req-dbg'), 'debug', url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer secret-token',
        Cookie: 'sid=123',
        'X-Builder-SDK': '@builder.io/sdk',
      },
    });

    expect(spies.info).toHaveBeenCalledTimes(1);
    expect(spies.debug).toHaveBeenCalledTimes(2);
    expect(spies.debug.mock.calls[0][1]).toEqual({
      headers: {
        Authorization: 'Bearer [REDACTED]',
        Cookie: '[REDACTED]',
        'X-Builder-SDK': '@builder.io/sdk',
      },
    });
    expect(spies.debug.mock.calls[1][1]).toMatchObject({
      status: 200,
      requestId: 'req-dbg',
      headers: { 'x-request-id': 'req-dbg', 'x-cache': 'HIT' },
    });
  });

  test('handles missing headers or entries()-only headers without throwing', async () => {
    const entriesFetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {
        get: () => null,
        entries: () => [['content-type', 'application/json']],
      },
    });
    await fetchWithLogging(entriesFetch, 'debug', url);
    expect(spies.info.mock.calls[0][0]).toContain('no x-request-id header');
    expect(spies.debug.mock.calls[1][1].headers).toEqual({ 'content-type': 'application/json' });

    await expect(
      fetchWithLogging(jest.fn().mockResolvedValue({ status: 500 }), 'debug', url)
    ).resolves.toEqual({ status: 500 });
  });
});
