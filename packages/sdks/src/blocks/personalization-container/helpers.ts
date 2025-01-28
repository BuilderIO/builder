import { TARGET } from '../../constants/target.js';
import { isBrowser } from '../../functions/is-browser.js';
import { isEditing } from '../../functions/is-editing.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import {
  FILTER_WITH_CUSTOM_TARGETING_SCRIPT,
  PERSONALIZATION_SCRIPT,
} from './helpers/inlined-fns.js';
import type { PersonalizationContainerProps } from './personalization-container.types.js';

export type UserAttributes = {
  date?: string | Date;
  urlPath?: string;
  [key: string]: any;
};

type QueryOperator =
  | 'is'
  | 'isNot'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqualTo'
  | 'lessThanOrEqualTo';

type QueryValue = string | number | boolean | Array<string | number | boolean>;

export type Query = {
  property: string;
  operator: QueryOperator;
  value: QueryValue;
};

export function checkShouldRenderVariants(
  variants: PersonalizationContainerProps['variants'],
  canTrack: boolean
) {
  const hasVariants = variants && variants.length > 0;

  if (TARGET === 'reactNative') return false;

  if (!hasVariants) return false;
  if (!canTrack) return false;

  if (TARGET === 'vue' || TARGET === 'svelte') return true;

  if (isBrowser()) return false;

  return true;
}

export function getBlocksToRender({
  variants,
  previewingIndex,
  isHydrated,
  filteredVariants,
  fallbackBlocks,
}: {
  variants: PersonalizationContainerProps['variants'];
  previewingIndex?: number | null;
  isHydrated: boolean;
  filteredVariants: PersonalizationContainerProps['variants'];
  fallbackBlocks?: BuilderBlock[];
}): {
  blocks: BuilderBlock[];
  path: string | undefined;
} {
  const fallback = {
    blocks: fallbackBlocks ?? [],
    path: 'this.children',
  };

  if (isHydrated && isEditing()) {
    // If editing a specific variant
    if (
      typeof previewingIndex === 'number' &&
      previewingIndex < (variants?.length ?? 0)
    ) {
      const variant = variants![previewingIndex];
      return {
        blocks: variant.blocks,
        path: `component.options.variants.${previewingIndex}.blocks`,
      };
    }
    // Otherwise we're editing the default variant
    return fallback;
  }

  // If not editing, check if there's a winning variant
  if (isBrowser()) {
    const winningVariant = filteredVariants?.[0];
    if (winningVariant) {
      return {
        blocks: winningVariant.blocks,
        path: `component.options.variants.${variants?.indexOf(winningVariant)}.blocks`,
      };
    }
  }

  // If no winning variant and we are on the server, return the default variant
  return fallback;
}

export const getPersonalizationScript = (
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  locale?: string
) => {
  return `
  (function() {
    ${FILTER_WITH_CUSTOM_TARGETING_SCRIPT}
    ${PERSONALIZATION_SCRIPT}
    getPersonalizedVariant(${JSON.stringify(variants)}, "${blockId}"${locale ? `, "${locale}"` : ''})
  })();
  `;
};

export { filterWithCustomTargeting } from './helpers/inlined-fns.js';
