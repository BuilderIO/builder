import { getIdFromSearchParams } from './helpers.js';
import { init } from './init.js';
import type { GlobalWCache } from './types.js';

export function getPreviewContent(searchParams: URLSearchParams) {
  init();

  const id = getIdFromSearchParams(searchParams);

  return typeof id === 'string'
    ? (globalThis as GlobalWCache)._BUILDER_PREVIEW_LRU_CACHE.get(id)
    : undefined;
}
