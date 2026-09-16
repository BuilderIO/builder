export const DEFAULT_WRITE_CONCURRENCY = 5;
export const DEFAULT_WRITE_RETRIES = 4;

export interface FetchLikeResponse {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  headers?: { get(name: string): string | null };
}

export type FetchLike = (url: string, init?: any) => Promise<FetchLikeResponse>;

export interface PostJsonOptions {
  fetchImpl: FetchLike;
  url: string;
  body: any;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  retries?: number;
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const isRetriableStatus = (status: number) => status === 408 || status === 429 || status >= 500;

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
 * Posts JSON and treats a non-ok response as a failure. Without this a rate
 * limited or rejected write is indistinguishable from a successful one.
 */
export const postJsonWithRetry = async ({
  fetchImpl,
  url,
  body,
  method = 'POST',
  headers,
  retries = DEFAULT_WRITE_RETRIES,
  baseDelayMs = 500,
  sleep = defaultSleep,
}: PostJsonOptions): Promise<FetchLikeResponse> => {
  let lastError: Error | undefined;
  const backoffMs = (attempt: number) => baseDelayMs * Math.pow(2, attempt);

  for (let attempt = 0; attempt <= retries; attempt++) {
    let response: FetchLikeResponse;
    try {
      response = await fetchImpl(url, {
        method,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) {
        await sleep(backoffMs(attempt));
      }
      continue;
    }

    if (response.ok) {
      return response;
    }

    const detail = await response.text().catch(() => '');
    lastError = new Error(
      `Request failed with status ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`
    );

    if (!isRetriableStatus(response.status)) {
      throw lastError;
    }

    if (attempt < retries) {
      await sleep(retryAfterMs(response) ?? backoffMs(attempt));
    }
  }

  throw lastError || new Error(`Request to ${url} failed`);
};
