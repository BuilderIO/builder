/**
 * This is an LRU cache to hold preview content on the server-side.
 *
 * Note: This logic is only used by the NextJS SDK.
 */

import type { BuilderContent } from '../../types/builder-content.js';
import type { LRUCache } from './helpers.js';

type BuilderLRUCache = LRUCache<string, BuilderContent>;

export type GlobalWCache = typeof globalThis & {
  _BUILDER_PREVIEW_LRU_CACHE: BuilderLRUCache;
};
