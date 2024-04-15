import { TARGET } from '../../constants/target.js';
import { isBrowser } from '../../functions/is-browser.js';
import type { Nullable } from '../../helpers/nullable.js';
import type { BuilderContent } from '../../types/builder-content.js';
import type { Target } from '../../types/targets.js';
import {
  UPDATE_COOKIES_AND_STYLES_SCRIPT,
  UPDATE_VARIANT_VISIBILITY_SCRIPT,
} from './inlined-fns.js';

/**
 * We hardcode explicit function names here, because the `.toString()` of a function can change depending on the bundler.
 * Some bundlers will minify the fn name, etc.
 *
 * So we hardcode the function names here, and then use those names in the script string to make sure the function names are consistent.
 */
const UPDATE_COOKIES_AND_STYLES_SCRIPT_NAME = 'builderIoAbTest';
const UPDATE_VARIANT_VISIBILITY_SCRIPT_FN_NAME = 'builderIoRenderContent';

export const getVariants = (content: Nullable<BuilderContent>) =>
  Object.values(content?.variations || {}).map((variant) => ({
    ...variant,
    testVariationId: variant.id,
    id: content?.id,
  }));

export const checkShouldRenderVariants = ({
  canTrack,
  content,
}: {
  canTrack: Nullable<boolean>;
  content: Nullable<BuilderContent>;
}) => {
  const hasVariants = getVariants(content).length > 0;

  /**
   * We cannot SSR in React-Native.
   */
  if (TARGET === 'reactNative') return false;

  if (!hasVariants) return false;
  if (!canTrack) return false;

  /**
   * For Vue and Svelte, we need to (initially) render the variants. This is to avoid hydration mismatch errors.
   *
   * Unlike React, Vue's hydration checks are shallow and do not check the attributes/contents of each element, so we
   * are able to modify the `hidden` HTML attributes and `display` CSS properties without causing a hydration mismatch error.
   *
   * NOTE: For Solid/Svelte: after the app is hydrated, we strip the variants from the DOM (on mount) to reduce the amount of HTML in the DOM.
   * This isn't necessary, just a nice to have.
   */
  if (TARGET === 'vue' || TARGET === 'svelte') return true;

  if (isBrowser()) return false;

  return true;
};

type VariantData = {
  id: string;
  testRatio?: number;
};

const getIsHydrationTarget = (target: Target) =>
  target === 'react' || target === 'reactNative';

const isHydrationTarget = getIsHydrationTarget(TARGET);

export const getInitVariantsFnsScriptString = () => `
  window.${UPDATE_COOKIES_AND_STYLES_SCRIPT_NAME} = ${UPDATE_COOKIES_AND_STYLES_SCRIPT}
  window.${UPDATE_VARIANT_VISIBILITY_SCRIPT_FN_NAME} = ${UPDATE_VARIANT_VISIBILITY_SCRIPT}
  `;

export const getUpdateCookieAndStylesScript = (
  variants: VariantData[],
  contentId: string
) => `
  window.${UPDATE_COOKIES_AND_STYLES_SCRIPT_NAME}(
    "${contentId}",${JSON.stringify(variants)}, ${isHydrationTarget}
  )`;

export const getUpdateVariantVisibilityScript = ({
  contentId,
  variationId,
}: {
  variationId: string;
  contentId: string;
}) =>
  `window.${UPDATE_VARIANT_VISIBILITY_SCRIPT_FN_NAME}(
    "${variationId}", "${contentId}", ${isHydrationTarget}
  )`;
