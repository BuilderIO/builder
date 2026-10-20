// Minimal, isomorphic diagnostic logging for SDK network calls.
//
// This intentionally avoids taking a dependency on something like the `debug` package so it
// stays safe to load in the browser, React Native, and edge runtimes, in addition to Node.js.

export type BuilderLogLevel = 'silent' | 'debug';

const ENV_VAR_NAME = 'BUILDER_SDK_LOG_LEVEL';

function normalizeLogLevel(value: string | undefined | null): BuilderLogLevel {
  return typeof value === 'string' && value.toLowerCase() === 'debug' ? 'debug' : 'silent';
}

/**
 * Reads the initial log level from the `BUILDER_SDK_LOG_LEVEL` environment variable when
 * running under Node.js (e.g. `BUILDER_SDK_LOG_LEVEL=debug`). Falls back to `'silent'` in
 * environments where `process.env` isn't available, such as the browser, without throwing.
 *
 * `Builder.logLevel` can also be set programmatically at any time, which is the only option
 * in bundled browser code where environment variables aren't available at runtime.
 */
export function getDefaultLogLevel(): BuilderLogLevel {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return normalizeLogLevel(process.env[ENV_VAR_NAME]);
    }
  } catch (err) {
    // `process` can be a getter that throws in some sandboxed environments (e.g. certain
    // edge runtimes). Treat that the same as "not available".
  }
  return 'silent';
}

interface FetchDebugInfo {
  method?: string;
  url: string;
  response: {
    status: number;
    headers?: {
      get: (name: string) => string | null | undefined;
    };
  };
}

/**
 * Logs request/response metadata for a single SDK fetch call, gated behind `logLevel`.
 *
 * Reads (but does not consume) the `x-request-id` response header so it can be included
 * alongside `console.debug` output for the caller. This is meant to make it possible to
 * correlate a specific SDK call with a Builder-side request when reporting intermittent API
 * issues, without changing the SDK's public response shape.
 */
export function logFetchDebugInfo(logLevel: BuilderLogLevel, info: FetchDebugInfo): void {
  if (logLevel !== 'debug') {
    return;
  }

  let requestId: string | null | undefined;
  try {
    requestId = info.response.headers?.get('x-request-id');
  } catch (err) {
    // Some minimal `Headers`-like polyfills may not implement `.get()`. Don't let diagnostic
    // logging ever break the actual request.
  }

  // eslint-disable-next-line no-console
  console.debug(
    `[Builder SDK] ${info.method ?? 'GET'} ${info.url} -> ${info.response.status}` +
      (requestId ? ` (x-request-id: ${requestId})` : ' (no x-request-id header on response)')
  );
}
