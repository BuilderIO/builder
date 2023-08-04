import { getIdFromSearchParams } from './helpers';
import { init } from './init';
import type { GlobalWCache } from './types';

export function getPreviewContent(searchParams: URLSearchParams) {
  init();

  const id = getIdFromSearchParams(searchParams);

  return typeof id === 'string'
    ? (globalThis as GlobalWCache)._BUILDER_PREVIEW_LRU_CACHE.get(id)
    : undefined;
}
