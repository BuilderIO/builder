import { TARGET } from '../../constants/target';
import { isBrowser } from '../../functions/is-browser';
import type { Nullable } from '../../helpers/nullable';
import type { BuilderContent } from '../../types/builder-content';
import type { Target } from '../../types/targets';
import { BLDR_AB_TEST_SCRIPT, BLDR_CONTENT_SCRIPT } from './inlined-fns';

/**
 * We hardcode explicit function names here, because the `.toString()` of a function can change depending on the bundler.
 * Some bundlers will minify the fn name, etc.
 *
 * So we hardcode the function names here, and then use those names in the script string to make sure the function names are consistent.
 */
const AB_TEST_FN_NAME = 'builderIoAbTest';
const CONTENT_FN_NAME = 'builderIoRenderContent';
export const getVariants = (content: Nullable<BuilderContent>) =>
  Object.values(content?.variations || {}).map((variant) => ({
    ...variant,
    testVariationId: variant.id,
    id: content?.id,
  }));
export const checkShouldRunVariants = ({
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
   * For Vue 2 and Vue 3, we need to (initially) render the variants. This is to avoid hydration mismatch errors.
   * Unlike React, Vue's hydration checks are shallow and do not check the attributes/contents of each element, so we
   * are able to modify the `hidden` HTML attributes and `display` CSS properties without causing a hydration mismatch error.
   *
   * NOTE: after the app is hydrated, we strip the variants from the DOM (on mount) to reduce the amount of HTML in the DOM.
   */
  if (TARGET === 'vue2' || TARGET === 'vue3') return true;
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
export const getScriptString = () => `
  window.${AB_TEST_FN_NAME} = ${BLDR_AB_TEST_SCRIPT}
  window.${CONTENT_FN_NAME} = ${BLDR_CONTENT_SCRIPT}
  `;
export const getVariantsScriptString = (
  variants: VariantData[],
  contentId: string
) => `
  window.${AB_TEST_FN_NAME}(
    "${contentId}",${JSON.stringify(variants)}, ${isHydrationTarget}
  )`;
export const getRenderContentScriptString = ({
  contentId,
  variationId,
}: {
  variationId: string;
  contentId: string;
}) => `window.${CONTENT_FN_NAME}(
    "${variationId}", "${contentId}", ${isHydrationTarget}
  )`;
