import { TARGET } from '../../constants/target.js';
import { isBrowser } from '../../functions/is-browser.js';
import type { Nullable } from '../../helpers/nullable.js';
import type { BuilderContent } from '../../types/builder-content.js';
import type { Target } from '../../types/targets.js';
import {
  AB_TEST_FN_NAME,
  BLDR_AB_TEST_SCRIPT,
  BLDR_CONTENT_SCRIPT,
  CONTENT_FN_NAME,
} from './inlined-fns.js';

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
}) =>
  `window.${CONTENT_FN_NAME}(
    "${variationId}", "${contentId}", ${isHydrationTarget}
  )`;
