import { TARGET } from '../../constants/target';
import { isBrowser } from '../../functions/is-browser';
import type { Nullable } from '../../helpers/nullable';
import type { BuilderContent } from '../../types/builder-content';
import type { Target } from '../../types/targets';

export const getVariants = (content: Nullable<BuilderContent>) =>
  Object.values(content?.variations || {});

export const checkShouldRunVariants = ({
  canTrack,
  content,
}: {
  canTrack: Nullable<boolean>;
  content: Nullable<BuilderContent>;
}) => {
  const hasVariants = getVariants(content).length > 0;

  if (!hasVariants) {
    return false;
  }

  if (!canTrack) {
    return false;
  }

  if (isBrowser()) {
    return false;
  }

  return true;
};

type VariantData = {
  id: string;
  testRatio?: number;
};

/**
 * NOTE: when this function is stringified, single-line comments can cause weird issues when compiled by Sveltekit.
 * Make sure to write multi-line comments only.
 */
const variantScriptFn = function bldrAbTest(
  contentId: string,
  variants: VariantData[],
  target: Target
) {
  function getAndSetVariantId(): string {
    function setCookie(name: string, value: string, days?: number) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie =
        name +
        '=' +
        (value || '') +
        expires +
        '; path=/' +
        '; Secure; SameSite=None';
    }
    function getCookie(name: string) {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
    const cookieName = `builder.tests.${contentId}`;
    const variantInCookie = getCookie(cookieName);
    const availableIDs = variants.map((vr) => vr.id).concat(contentId);
    /**
     * cookie already exists
     */
    if (variantInCookie && availableIDs.includes(variantInCookie)) {
      return variantInCookie;
    }

    /**
     * no cookie exists, find variant
     */
    let n = 0;
    const random = Math.random();
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const testRatio = variant.testRatio;
      n += testRatio!;
      if (random < n) {
        setCookie(cookieName, variant.id);
        return variant.id;
      }
    }

    /**
     * no variant found, assign default content
     */
    setCookie(cookieName, contentId);

    return contentId;
  }

  const winningVariantId = getAndSetVariantId();

  const styleEl = document.getElementById(
    `variants-styles-${contentId}`
  ) as HTMLStyleElement;

  /**
   * For React to work, we need hydration to match SSR, so we completely remove this node and the styles tag.
   */
  if (target === 'react' || target === 'reactNative') {
    styleEl.remove();
    const thisScriptEl = document.getElementById(
      `variants-script-${contentId}`
    );
    thisScriptEl?.remove();
  } else {
    /* update styles to hide all variants except the winning variant */
    const newStyleStr = variants
      .concat({ id: contentId })
      .filter((variant) => variant.id !== winningVariantId)
      .map((value) => {
        return `.variant-${value.id} {  display: none; }
        `;
      })
      .join('');

    /* TO-DO: check if this actually updates the style */
    styleEl.innerHTML = newStyleStr;
  }
};

/**
 * NOTE: when this function is stringified, single-line comments can cause weird issues when compiled by Sveltekit.
 * Make sure to write multi-line comments only.
 */
const variantScriptFn2 = function bldrCntntScrpt(
  variantContentId: string,
  defaultContentId: string,
  target: Target
) {
  if (!navigator.cookieEnabled) {
    return;
  }

  function getCookie(name: string) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  const cookieName = `builder.tests.${defaultContentId}`;
  const variantId = getCookie(cookieName);

  /** get parent div by searching on `builder-content-id` attr */
  const parentDiv = document.querySelector(
    `[builder-content-id="${variantContentId}"]`
  );

  console.log('checking variant', {
    variantId,
    variantContentId,
    defaultContentId,
  });
  const variantIsDefaultContent = variantContentId === defaultContentId;

  if (variantId === variantContentId) {
    if (variantIsDefaultContent) {
      /** the default content is already visible, no need to do anything */
      console.log('default content is already visible, no need to do anything');
      return;
    }

    /** this is the winning variant and not already visible: remove `hidden` and `aria-hidden` attr */

    console.log(
      'this is the winning variant and not already visible: remove `hidden` and `aria-hidden` attr'
    );
    parentDiv?.removeAttribute('hidden');
    parentDiv?.removeAttribute('aria-hidden');
  } else {
    if (variantIsDefaultContent) {
      console.log('this is not the winning variant, add `hidden` attr');

      if (target === 'react' || target === 'reactNative') {
        /**
         * For React to work, we need to support hydration, in which case the first CSR will have none of the hidden variants.
         * So we completely remove that node.
         */
        parentDiv?.remove();
      } else {
        /** this is not the winning variant, add `hidden` attr */
        parentDiv?.setAttribute('hidden', 'true');
        parentDiv?.setAttribute('aria-hidden', 'true');
      }
    }

    /** This is not the winning variant, and it's not the default content.
     * There's no need to hide it, because it's already hidden.
     */
    console.log(
      "This is not the winning variant, and it's not the default content. There's no need to hide it, because it's already hidden."
    );
    return;
  }

  return;
};

export const getVariantsScriptString = (
  variants: VariantData[],
  contentId: string
) => {
  const fnStr = variantScriptFn.toString().replace(/\s+/g, ' ');
  const fnStr2 = variantScriptFn2.toString().replace(/\s+/g, ' ');

  return `
  ${fnStr}
  ${fnStr2}
  bldrAbTest("${contentId}", ${JSON.stringify(variants)}, "${TARGET}")
  `;
};

export const getRenderContentScriptString = ({
  parentContentId,
  contentId,
}: {
  contentId: string;
  parentContentId: string;
}) => {
  return `
  bldrCntntScrpt("${contentId}", "${parentContentId}", "${TARGET}")`;
};
