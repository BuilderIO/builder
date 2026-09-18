export const DEFAULT_WRITE_CONCURRENCY = 5;
import { AbortController as PolyfillAbortController } from 'abort-controller';

// Node < 15 has no global AbortController at all -- referencing it directly
// would throw a ReferenceError on every single request. graphql-typed-client
// (via isomorphic-fetch) already falls back to node-fetch on such runtimes,
// and node-fetch's `signal` option works with either the native
// AbortController or this polyfill, so prefer native when it's available
// (it produces a proper AbortError; this polyfill's abort() doesn't set a
// `reason`, so a native `fetch` would otherwise reject with an unhelpful
// `undefined`) and only fall back to the polyfill where native support
// doesn't exist.
const NodeAbortController: { new (): AbortController } =
  typeof globalThis !== 'undefined' && typeof (globalThis as any).AbortController !== 'undefined'
    ? (globalThis as any).AbortController
    : (PolyfillAbortController as any);

export const DEFAULT_WRITE_RETRIES = 4;
export const DEFAULT_WRITE_TIMEOUT_MS = 30_000;

export interface FetchLikeResponse {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  headers?: { get(name: string): string | null };
}

export type FetchLike = (url: string, init?: any) => Promise<FetchLikeResponse>;

export interface HttpError extends Error {
  status?: number;
}

export const isHttpErrorWithStatus = (e: unknown, status: number): boolean =>
  e instanceof Error && (e as HttpError).status === status;

export interface PostJsonOptions {
  fetchImpl: FetchLike;
  url: string;
  body?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  retries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const isRetriableStatus = (status: number) => status === 408 || status === 429 || status >= 500;

export interface RetryAsyncOptions {
  retries?: number;
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Retries any async operation with exponential backoff. Unlike
 * `postJsonWithRetry`, this doesn't inspect HTTP status codes, so it's meant
 * for calls (like a GraphQL mutation through a typed client) where a thrown
 * error is the only failure signal available.
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  { retries = DEFAULT_WRITE_RETRIES, baseDelayMs = 500, sleep = defaultSleep }: RetryAsyncOptions = {}
): Promise<T> => {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) {
        await sleep(baseDelayMs * Math.pow(2, attempt));
      }
    }
  }
  throw lastError;
};

const retryAfterMs = (response: FetchLikeResponse) => {
  const header = response.headers?.get('retry-after');
  if (!header) {
    return undefined;
  }
  const seconds = Number(header);
  if (isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }
  const date = Date.parse(header);
  return isFinite(date) ? Math.max(0, date - Date.now()) : undefined;
};

export const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  const workers = Math.max(1, Math.min(Math.floor(concurrency) || 1, items.length));
  let cursor = 0;

  const run = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: workers }, run));
  return results;
};

/**
 * Sends a write API request (POST/PUT/DELETE) and treats a non-ok response
 * as a failure. Without this a rate limited or rejected write is
 * indistinguishable from a successful one. DELETE has no body.
 */
export const postJsonWithRetry = async ({
  fetchImpl,
  url,
  body,
  method = 'POST',
  headers,
  retries = DEFAULT_WRITE_RETRIES,
  baseDelayMs = 500,
  timeoutMs = DEFAULT_WRITE_TIMEOUT_MS,
  sleep = defaultSleep,
}: PostJsonOptions): Promise<FetchLikeResponse> => {
  let lastError: Error | undefined;
  const backoffMs = (attempt: number) => baseDelayMs * Math.pow(2, attempt);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new NodeAbortController();
    const init: {
      method: string;
      body?: string;
      headers: Record<string, string>;
      signal: AbortSignal;
    } = {
      method,
      headers: body === undefined ? { ...headers } : { 'Content-Type': 'application/json', ...headers },
      signal: controller.signal,
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    // a request that stalls forever (open connection, no response, or a
    // response whose body never finishes) would otherwise never reject and
    // would occupy a write-queue worker forever, so the timer stays armed
    // until the response (including its body) has been fully consumed
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let response: FetchLikeResponse;
      try {
        response = await fetchImpl(url, init);
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        if (attempt < retries) {
          await sleep(backoffMs(attempt));
        }
        continue;
      }

      // DELETE is idempotent: if an earlier attempt's response was lost
      // (timeout/network error) but the delete actually landed, the retry
      // sees a 404 for a target that's already gone — that's the desired
      // end state, not a failure
      const isRetriedDeleteNotFound = method === 'DELETE' && attempt > 0 && response.status === 404;

      if (response.ok || isRetriedDeleteNotFound) {
        // read the body now, while the timer can still abort a stalled
        // read — a caller consuming it later would no longer be protected.
        // build the returned object explicitly rather than spreading
        // `response`, since a real fetch Response exposes status/headers/ok
        // as prototype accessors that a spread would silently drop
        let bodyText: string;
        try {
          bodyText = await response.text();
        } catch (e) {
          // the body never finished (e.g. the timeout aborted a stalled
          // read) — treat it like any other failed attempt instead of
          // returning a fabricated "successful" response with a lost body
          lastError = e instanceof Error ? e : new Error(String(e));
          if (attempt < retries) {
            await sleep(backoffMs(attempt));
          }
          continue;
        }
        return { ok: true, status: response.status, headers: response.headers, text: async () => bodyText };
      }

      const detail = await response.text().catch(() => '');
      lastError = Object.assign(
        new Error(
          `Request failed with status ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`
        ),
        { status: response.status }
      );

      if (!isRetriableStatus(response.status)) {
        throw lastError;
      }

      if (attempt < retries) {
        await sleep(retryAfterMs(response) ?? backoffMs(attempt));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error(`Request to ${url} failed`);
};
