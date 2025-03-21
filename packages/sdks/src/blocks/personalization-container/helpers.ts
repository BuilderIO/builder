import { TARGET } from '../../constants/target.js';
import { isBrowser } from '../../functions/is-browser.js';
import { isEditing } from '../../functions/is-editing.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import {
  FILTER_WITH_CUSTOM_TARGETING_SCRIPT,
  PERSONALIZATION_SCRIPT,
  UPDATE_VISIBILITY_STYLES_SCRIPT,
} from './helpers/inlined-fns.js';
import type { PersonalizationContainerProps } from './personalization-container.types.js';

export const DEFAULT_INDEX = 'default';

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

type BlocksToRenderReturnType = {
  blocks: BuilderBlock[];
  path: string;
  index: number | typeof DEFAULT_INDEX;
};

export function checkShouldRenderVariants(
  variants: PersonalizationContainerProps['variants'],
  canTrack: boolean
) {
  const hasVariants = variants && variants.length > 0;

  if (TARGET === 'reactNative') return false;

  if (!hasVariants) return false;
  if (!canTrack) return false;

  if (TARGET === 'vue') return true;

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
}): BlocksToRenderReturnType {
  const fallback: BlocksToRenderReturnType = {
    blocks: fallbackBlocks ?? [],
    path: 'this.children',
    index: DEFAULT_INDEX,
  };

  if (isHydrated && isEditing()) {
    // If editing a specific variant
    if (
      typeof previewingIndex === 'number' &&
      previewingIndex < (variants?.length ?? 0)
    ) {
      const variant = variants?.[previewingIndex];
      if (variant) {
        return {
          blocks: variant.blocks,
          path: `component.options.variants.${previewingIndex}.blocks`,
          index: previewingIndex,
        };
      }
    }
    // Otherwise we're editing the default variant
    return fallback;
  }

  // If we're on the browser, check if there's a winning variant
  if (isBrowser()) {
    const winningVariant = filteredVariants?.[0];
    if (winningVariant && variants) {
      const variantIndex = variants.indexOf(winningVariant);
      if (variantIndex !== -1) {
        return {
          blocks: winningVariant.blocks,
          path: `component.options.variants.${variantIndex}.blocks`,
          index: variantIndex,
        };
      }
    }
  }

  // If no winning variant or we are on the server, return the default variant
  return fallback;
}

export const getInitPersonalizationVariantsFnsScriptString = () => {
  return `
  window.filterWithCustomTargeting = ${FILTER_WITH_CUSTOM_TARGETING_SCRIPT}
  window.builderIoPersonalization = ${PERSONALIZATION_SCRIPT}
  window.updateVisibilityStylesScript = ${UPDATE_VISIBILITY_STYLES_SCRIPT}
  `;
};

const isHydrationTarget = TARGET === 'react' || TARGET === 'svelte';

export const getPersonalizationScript = (
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  locale?: string
) => {
  return `window.builderIoPersonalization(${JSON.stringify(variants)}, "${blockId}", ${isHydrationTarget}${locale ? `, "${locale}"` : ''})`;
};

export const getUpdateVisibilityStylesScript = (
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  locale?: string
) => {
  return `window.updateVisibilityStylesScript(${JSON.stringify(variants)}, "${blockId}", ${isHydrationTarget}${locale ? `, "${locale}"` : ''})`;
};

export { filterWithCustomTargeting } from './helpers/inlined-fns.js';
