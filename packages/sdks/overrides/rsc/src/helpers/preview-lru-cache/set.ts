'use server';

import type { BuilderContent } from '../../types/builder-content.js';
import { init } from './init.js';
import type { GlobalWCache } from './types.js';

export async function postPreviewContent({
  key,
  value,
}: {
  key: string;
  value: BuilderContent;
}) {
  init();

  (globalThis as GlobalWCache)._BUILDER_PREVIEW_LRU_CACHE.set(key, value);

  return { [key]: value };
}
