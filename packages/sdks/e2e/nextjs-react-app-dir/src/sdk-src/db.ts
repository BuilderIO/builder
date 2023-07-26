import { LRUCache } from 'lru-cache';
import { BuilderContent } from '@builder.io/sdks-e2e-tests/dist/src/specs/types';

const options = {
  max: 500,
  // how long to live in ms
  ttl: 1000 * 60 * 5,
};

export const fancy_store = new LRUCache<string, BuilderContent>(options);


export const getPreviewContent = (
  searchParams: URLSearchParams | Record<string, string | string[]>
) => {
  const id = searchParams['overrides.page']
  console.log('Getting preview content', fancy_store.get(id));
  return fancy_store.get(id)
};
