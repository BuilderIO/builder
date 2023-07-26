'use server'

import { LRUCache } from 'lru-cache';
import { BuilderContent } from './types/builder-content';

const options: LRUCache.Options<string, BuilderContent, unknown> = {
  max: 500,
  // how long to live in ms
  ttl: 1000 * 60 * 5,
};

globalThis._BUILDER_PREVIEW_LRU_CACHE = new LRUCache<string, BuilderContent>(options);

export async function getPreviewContent(
  searchParams: URLSearchParams | Record<string, string | string[]>
) {
  const id = searchParams instanceof URLSearchParams ? searchParams.get('overrides.page') : searchParams['overrides.page']
  return globalThis._BUILDER_PREVIEW_LRU_CACHE.get(id)
};


export async function postPreviewContent({ key, value }: { key: string; value: BuilderContent }) {
  'use server'
  globalThis._BUILDER_PREVIEW_LRU_CACHE.set(key, value)
  
  return { [key]: value}
}