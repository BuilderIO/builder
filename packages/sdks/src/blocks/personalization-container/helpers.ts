import { TARGET } from '../../constants/target.js';
import { isBrowser } from '../../functions/is-browser.js';
import { isEditing } from '../../functions/is-editing.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import type { Target } from '../../types/targets.js';
import {
  FILTER_WITH_CUSTOM_TARGETING_SCRIPT,
  PERSONALIZATION_SCRIPT,
  UPDATE_VISIBILITY_STYLES_SCRIPT,
} from './helpers/inlined-fns.js';
import type { PersonalizationContainerProps } from './personalization-container.types.js';

export const DEFAULT_INDEX = 'default';

const FILTER_WITH_CUSTOM_TARGETING_SCRIPT_FN_NAME = 'filterWithCustomTargeting';
const BUILDER_IO_PERSONALIZATION_SCRIPT_FN_NAME = 'builderIoPersonalization';
const UPDATE_VARIANT_VISIBILITY_SCRIPT_FN_NAME = 'updateVisibilityStylesScript';

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

/**
 * SDKs that support Variant Containers
 */
export const SDKS_SUPPORTING_PERSONALIZATION = [
  'react',
  'vue',
  'svelte',
] as Target[];

/**
 * After hydration, we reset the tree
 * These SDKs handle Personalization Container in a special way:
 * - first, the inlined script will help us add `display: none`, `aria-hidden: true` and `hidden: true` to the non-winning variants
 * - then, on mount / when the component is hydrated - we reset the tree with only the winning variant and deleting the entire tree
 *
 * This helps us to avoid flicker and show the correct / winning variant initially and then once we've hydrated we show the winning variant
 * and keep a track of the cookies to update to the correct variant dynamically when the cookie updates.
 */
export const SDKS_REQUIRING_RESET_APPROACH = ['vue', 'svelte'] as Target[];

export function checkShouldRenderVariants(
  variants: PersonalizationContainerProps['variants'],
  canTrack: boolean
) {
  const hasVariants = variants && variants.length > 0;

  if (TARGET === 'reactNative') return false;

  if (!hasVariants) return false;
  if (!canTrack) return false;

  if (SDKS_REQUIRING_RESET_APPROACH.includes(TARGET)) return true;

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
          path: `variants.${previewingIndex}.blocks`,
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
          path: `variants.${variantIndex}.blocks`,
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
  window.${FILTER_WITH_CUSTOM_TARGETING_SCRIPT_FN_NAME} = ${FILTER_WITH_CUSTOM_TARGETING_SCRIPT}
  window.${BUILDER_IO_PERSONALIZATION_SCRIPT_FN_NAME} = ${PERSONALIZATION_SCRIPT}
  window.${UPDATE_VARIANT_VISIBILITY_SCRIPT_FN_NAME} = ${UPDATE_VISIBILITY_STYLES_SCRIPT}
  `;
};

const isHydrationTarget = TARGET === 'react';

export const getPersonalizationScript = (
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  locale?: string
) => {
  return `window.${BUILDER_IO_PERSONALIZATION_SCRIPT_FN_NAME}(${JSON.stringify(variants)}, "${blockId}", ${isHydrationTarget}${locale ? `, "${locale}"` : ''})`;
};

export const getUpdateVisibilityStylesScript = (
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  locale?: string
) => {
  return `window.${UPDATE_VARIANT_VISIBILITY_SCRIPT_FN_NAME}(${JSON.stringify(variants)}, "${blockId}", ${isHydrationTarget}${locale ? `, "${locale}"` : ''})`;
};

export { filterWithCustomTargeting } from './helpers/inlined-fns.js';
