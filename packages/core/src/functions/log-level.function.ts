// Minimal, isomorphic HTTP diagnostic logging for SDK network calls.
//
// Uses standard `console` log levels and methods (`error`, `warn`, `info`, `debug`) without
// external dependencies so it stays safe to load across browser, React Native, edge, and Node.js.

export type BuilderLogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

type ActiveLogLevel = Exclude<BuilderLogLevel, 'silent'>;

const LOG_PREFIX = '[Builder SDK]';
const SENSITIVE_HEADER = /^(authorization|proxy-authorization|cookie|set-cookie|x-api-key)$/i;

const LEVEL_PRIORITY: { [K in BuilderLogLevel]: number } = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

/**
 * Reads the initial log level from `BUILDER_SDK_LOG_LEVEL` under Node.js, falling back to
 * `'silent'` when unset, unrecognized, or running where `process.env` isn't available.
 */
export function getDefaultLogLevel(): BuilderLogLevel {
  try {
    const raw = typeof process !== 'undefined' && process.env?.BUILDER_SDK_LOG_LEVEL;
    const normalized = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
    if (normalized && normalized in LEVEL_PRIORITY) {
      return normalized as BuilderLogLevel;
    }
  } catch (err) {
    // `process` can throw in some sandboxed/edge runtimes; fall back to `'silent'`.
  }
  return 'silent';
}

function redactHeader(name: string, value: string): string {
  if (!SENSITIVE_HEADER.test(name)) {
    return value;
  }
  return /^bearer\s+/i.test(value) ? 'Bearer [REDACTED]' : '[REDACTED]';
}

function readHeaders(headers: any): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  if (!headers || typeof headers !== 'object') {
    return result;
  }

  try {
    if (typeof headers.forEach === 'function') {
      headers.forEach((value: string, key: string) => {
        result[key] = redactHeader(key, String(value));
      });
    } else if (typeof headers.entries === 'function') {
      const entries = headers.entries();
      if (Array.isArray(entries)) {
        for (let i = 0; i < entries.length; i++) {
          result[entries[i][0]] = redactHeader(entries[i][0], String(entries[i][1]));
        }
      }
    } else if (typeof headers.get !== 'function') {
      const keys = Object.keys(headers);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (headers[key] !== undefined) {
          result[key] = redactHeader(key, String(headers[key]));
        }
      }
    }
  } catch (err) {
    // Never let diagnostic header inspection break a request.
  }

  return result;
}

function getRequestId(headers: any): string | null {
  try {
    return (headers && typeof headers.get === 'function' && headers.get('x-request-id')) || null;
  } catch (err) {
    return null;
  }
}

function log(level: ActiveLogLevel, message: string, details?: unknown): void {
  if (typeof console === 'undefined') {
    return;
  }
  // eslint-disable-next-line no-console
  const fn = typeof console[level] === 'function' ? console[level] : console.log;
  if (typeof fn === 'function') {
    details !== undefined ? fn.call(console, message, details) : fn.call(console, message);
  }
}

/**
 * Wraps a `fetch`-compatible call and emits graduated `console.*` HTTP diagnostics according
 * to `logLevel` without consuming the response body stream.
 */
export function fetchWithLogging<TFetch extends (url: any, init?: any) => PromiseLike<any>>(
  fetchFn: TFetch,
  logLevel: BuilderLogLevel,
  url: string,
  requestOptions?: { method?: string; headers?: any; [key: string]: any }
): ReturnType<TFetch> {
  const invoke = fetchFn as unknown as (requestUrl: string, init?: any) => Promise<any>;
  const priority = LEVEL_PRIORITY[logLevel] || 0;
  if (priority === 0) {
    return invoke(url, requestOptions) as ReturnType<TFetch>;
  }

  const method = (requestOptions?.method || 'GET').toUpperCase();
  const startTime = Date.now();

  if (priority >= LEVEL_PRIORITY.debug) {
    log('debug', `${LOG_PREFIX} -> ${method} ${url}`, {
      headers: readHeaders(requestOptions?.headers),
    });
  }

  return invoke(url, requestOptions).then(
    (res: any) => {
      if (res && typeof res.status === 'number') {
        const durationMs = Date.now() - startTime;
        const requestId = getRequestId(res.headers);
        const reqIdLabel = requestId
          ? `x-request-id: ${requestId}`
          : 'no x-request-id header on response';
        const suffix = ` (${durationMs}ms, ${reqIdLabel})`;
        const resLevel: ActiveLogLevel =
          res.status >= 500 ? 'error' : res.status >= 400 ? 'warn' : 'info';

        if (priority >= LEVEL_PRIORITY[resLevel]) {
          log(resLevel, `${LOG_PREFIX} ${method} ${url} -> ${res.status}${suffix}`);
        }
        if (priority >= LEVEL_PRIORITY.debug) {
          log('debug', `${LOG_PREFIX} <- ${method} ${url} -> ${res.status}${suffix}`, {
            status: res.status,
            durationMs,
            requestId,
            headers: readHeaders(res.headers),
          });
        }
      }
      return res;
    },
    error => {
      const durationMs = Date.now() - startTime;
      log('error', `${LOG_PREFIX} ${method} ${url} -> network error (${durationMs}ms)`, error);
      throw error;
    }
  ) as ReturnType<TFetch>;
}
