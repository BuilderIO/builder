/**
 * WARNING: This file contains functions that get stringified and inlined into the HTML at build-time.
 * They cannot import anything.
 */

type VariantData = {
  id: string;
  testRatio?: number;
};

/**
 * For more information on how this works,
 * see our [SSR A/B Test Docs](https://github.com/BuilderIO/builder/tree/main/packages/sdks/src/SSR_AB_TEST.md)
 */
function updateCookiesAndStyles(
  contentId: string,
  variants: VariantData[],
  isHydrationTarget: boolean
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

  const styleEl = document.currentScript
    ?.previousElementSibling as HTMLStyleElement;

  /**
   * For React to work, we need hydration to match SSR, so we completely remove this node and the styles tag.
   */
  if (isHydrationTarget) {
    styleEl.remove();
    const thisScriptEl = document.currentScript;
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

    styleEl.innerHTML = newStyleStr;
  }
}

/**
 * For more information on how this works,
 * see our [SSR A/B Test Docs](https://github.com/BuilderIO/builder/tree/main/packages/sdks/docs/SSR_AB_TEST.md)
 */
function updateVariantVisibility(
  variantContentId: string,
  defaultContentId: string,
  isHydrationTarget: boolean
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
  const winningVariant = getCookie(cookieName);

  const parentDiv = document.currentScript?.parentElement;

  const isDefaultContent = variantContentId === defaultContentId;
  const isWinningVariant = winningVariant === variantContentId;

  /**
   * For all frameworks, we need to:
   *  - make the winning (non-default) variant visible.
   *  - hide the non-winning variants.
   *
   * Technically, the second step is redundant in hydration frameworks,
   * as we delete the entire content at the end of this script.
   * However, this vastly simplifies the logic.
   */
  if (isWinningVariant && !isDefaultContent) {
    parentDiv?.removeAttribute('hidden');
    parentDiv?.removeAttribute('aria-hidden');
  } else if (!isWinningVariant && isDefaultContent) {
    parentDiv?.setAttribute('hidden', 'true');
    parentDiv?.setAttribute('aria-hidden', 'true');
  }

  if (isHydrationTarget) {
    /**
     * For Hydration frameworks, we need to remove the node if it's not the winning variant.
     */
    if (!isWinningVariant) {
      parentDiv?.remove();
    }

    /**
     * For Hydration frameworks, we need to remove this script tag as it doesn't render in CSR.
     */
    const thisScriptEl = document.currentScript;
    thisScriptEl?.remove();
  }
  return;
}

export const UPDATE_COOKIES_AND_STYLES_SCRIPT = updateCookiesAndStyles
  .toString()
  .replace(/\s+/g, ' ');
export const UPDATE_VARIANT_VISIBILITY_SCRIPT = updateVariantVisibility
  .toString()
  .replace(/\s+/g, ' ');
