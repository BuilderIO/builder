import { logger } from '../logger.js';

export const getIdFromSearchParams = (searchParams: URLSearchParams) => {
  const previewedModel = searchParams.get('preview');
  const previewedId = searchParams.get('overrides.' + previewedModel);

  if (!previewedId) {
    logger.warn('No previewed ID found in search params.');
  }

  return previewedId;
};

export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor({ capacity }: { capacity: number }) {
    this.capacity = capacity;
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Remove and re-insert the key-value pair to move it to the end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // If the key exists, remove it first
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // If the cache is at capacity, remove the least recently used item (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // Add the new key-value pair
    this.cache.set(key, value);
  }
}
