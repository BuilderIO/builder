/**
 * This is an LRU cache to hold preview content on the server-side.
 *
 * Note: This logic is only used by the NextJS SDK.
 */

import type { LRUCache } from 'lru-cache';
import type { BuilderContent } from '../../types/builder-content.js';

type BuilderLRUCache = LRUCache<string, BuilderContent>;

export type GlobalWCache = typeof globalThis & {
  _BUILDER_PREVIEW_LRU_CACHE: BuilderLRUCache;
};
