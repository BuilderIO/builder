import { getDefaultLogLevel, logFetchDebugInfo } from './log-level.function';

describe('getDefaultLogLevel', () => {
  const originalEnv = process.env.BUILDER_SDK_LOG_LEVEL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.BUILDER_SDK_LOG_LEVEL;
    } else {
      process.env.BUILDER_SDK_LOG_LEVEL = originalEnv;
    }
  });

  test('defaults to silent when the env var is unset', () => {
    delete process.env.BUILDER_SDK_LOG_LEVEL;
    expect(getDefaultLogLevel()).toBe('silent');
  });

  test('returns debug when BUILDER_SDK_LOG_LEVEL=debug', () => {
    process.env.BUILDER_SDK_LOG_LEVEL = 'debug';
    expect(getDefaultLogLevel()).toBe('debug');
  });

  test('is case-insensitive', () => {
    process.env.BUILDER_SDK_LOG_LEVEL = 'DEBUG';
    expect(getDefaultLogLevel()).toBe('debug');
  });

  test('falls back to silent for unrecognized values', () => {
    process.env.BUILDER_SDK_LOG_LEVEL = 'verbose';
    expect(getDefaultLogLevel()).toBe('silent');
  });
});

describe('logFetchDebugInfo', () => {
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  test('does not log when log level is silent', () => {
    logFetchDebugInfo('silent', {
      url: 'https://cdn.builder.io/api/v3/content/page',
      response: { status: 200, headers: { get: () => 'req-123' } },
    });

    expect(debugSpy).not.toHaveBeenCalled();
  });

  test('logs the url, status, and x-request-id header when log level is debug', () => {
    logFetchDebugInfo('debug', {
      method: 'GET',
      url: 'https://cdn.builder.io/api/v3/content/page',
      response: { status: 200, headers: { get: () => 'req-123' } },
    });

    expect(debugSpy).toHaveBeenCalledTimes(1);
    const [message] = debugSpy.mock.calls[0];
    expect(message).toContain('GET');
    expect(message).toContain('https://cdn.builder.io/api/v3/content/page');
    expect(message).toContain('200');
    expect(message).toContain('req-123');
  });

  test('notes when there is no x-request-id header, without throwing', () => {
    logFetchDebugInfo('debug', {
      url: 'https://cdn.builder.io/api/v3/content/page',
      response: { status: 200, headers: { get: () => null } },
    });

    expect(debugSpy).toHaveBeenCalledTimes(1);
    const [message] = debugSpy.mock.calls[0];
    expect(message).toContain('no x-request-id header');
  });

  test('does not throw when the response has no headers object at all', () => {
    expect(() =>
      logFetchDebugInfo('debug', {
        url: 'https://cdn.builder.io/api/v3/content/page',
        response: { status: 500 },
      })
    ).not.toThrow();

    expect(debugSpy).toHaveBeenCalledTimes(1);
  });
});
