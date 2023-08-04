'use server';

import type { BuilderContent } from '../../types/builder-content';
import { init } from './init';
import type { GlobalWCache } from './types';

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
