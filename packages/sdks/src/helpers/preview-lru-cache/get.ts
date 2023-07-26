import { init } from './init';
import type { GlobalWCache } from './types';

export function getPreviewContent(
  searchParams: URLSearchParams | Record<string, string | string[]>
) {
  init();

  const id =
    searchParams instanceof URLSearchParams
      ? searchParams.get('overrides.page')
      : searchParams['overrides.page'];
  return typeof id === 'string'
    ? (globalThis as GlobalWCache)._BUILDER_PREVIEW_LRU_CACHE.get(id)
    : undefined;
}
