import React from 'react';
import { CacheProvider, EmotionCache, SerializedStyles, withEmotionCache } from '@emotion/core';

type ServerEmotionCache = EmotionCache & {
  insert(
    selector: string,
    serialized: SerializedStyles,
    sheet: EmotionCache['sheet'],
    shouldCache: boolean
  ): string | void;
};

/**
 * Gives a server-rendered variant its own record of emitted styles, so every variant and the
 * default content carry the styles they use. The inline variant scripts discard the branches
 * that lose, together with any style tags inside them.
 */
export const VariantStyles = withEmotionCache<{ children: React.ReactNode }>(
  ({ children }, parentCache) => {
    const cache: ServerEmotionCache = {
      ...parentCache,
      compat: undefined,
      inserted: {},
      registered: { ...parentCache.registered },
      insert(selector, serialized, sheet, shouldCache) {
        // A template must not suppress style emission in another branch.
        const rules = (parentCache as ServerEmotionCache).insert(
          selector,
          serialized,
          sheet,
          false
        );
        if (shouldCache) {
          cache.inserted[serialized.name] = true;
        }
        return rules;
      },
    };
    return <CacheProvider value={cache}>{children}</CacheProvider>;
  }
);
