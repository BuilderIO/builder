'use server';

import { revalidatePath } from 'next/cache';
import type { BuilderContent } from '../../types/builder-content.js';
import { init } from './init.js';
import type { GlobalWCache } from './types.js';

export async function postPreviewContent({
  key,
  value,
  url,
}: {
  key: string;
  value: BuilderContent;
  url: string;
}) {
  init();

  (globalThis as GlobalWCache)._BUILDER_PREVIEW_LRU_CACHE.set(key, value);

  revalidatePath(url);
}
