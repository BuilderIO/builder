/**
 * WARNING: This file contains functions that get stringified and inlined into the HTML. They cannot import anything.
 */

type VariantData = {
  id: string;
  testRatio?: number;
};

/**
 * NOTE: when this function is stringified, single-line comments can cause weird issues when compiled by Sveltekit.
 * Make sure to write multi-line comments only.
 */

/**
 * NOTE: when this function is stringified, single-line comments can cause weird issues when compiled by Sveltekit.
 * Make sure to write multi-line comments only.
 */

/**
 * IMPORTANT: both of these stringifications happen at compile-time to guarantee that the strings
 * are always the exact same. This is crucial to avoiding hydration mismatches.
 */
export const BLDR_AB_TEST_SCRIPT = `function bldrAbTest(contentId, variants, isHydrationTarget) {
  console.log('inside of BLDR_AB_TEST_SCRIPT');
    function getAndSetVariantId() {
      function setCookie(name, value, days) {
        let expires = '';
      if (days) {
          const date = new Date();
          date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
          expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + (value || '') + expires + '; path=/' + '; Secure; SameSite=None';
    }
    function getCookie(name) {
        const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
    const cookieName = \`builder.tests.\${contentId}\`;
    const variantInCookie = getCookie(cookieName);
    const availableIDs = variants.map(vr => vr.id).concat(contentId);
    if (variantInCookie && availableIDs.includes(variantInCookie)) {
        return variantInCookie;
    }
    let n = 0;
    const random = Math.random();
    for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const testRatio = variant.testRatio;
        n += testRatio;
        if (random < n) {
          setCookie(cookieName, variant.id);
          return variant.id;
      }
    }
    setCookie(cookieName, contentId);
    return contentId;
  }
  const winningVariantId = getAndSetVariantId();
  const styleEl = document.currentScript?.previousElementSibling;
  if (isHydrationTarget) {
      console.log('isHydrationTarget. removing: ', {
        styleEl,
        thisScriptEl: document.currentScript
      })
      styleEl.remove();
      const thisScriptEl = document.currentScript;
      thisScriptEl?.remove();
  } else {
      const newStyleStr = variants.concat({
        id: contentId
    }).filter(variant => variant.id !== winningVariantId).map(value => {
        return \`.variant-\${value.id} {  display: none; }
        \`;
    }).join('');
    styleEl.innerHTML = newStyleStr;
  }
}`;

export const BLDR_CONTENT_SCRIPT = `function bldrCntntScrpt(variantContentId, defaultContentId, isHydrationTarget) {
  console.log('inside of BLDR_CONTENT_SCRIPT');
    if (!navigator.cookieEnabled) {
      return;
  }
  function getCookie(name) {
      const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  const cookieName = \`builder.tests.\${defaultContentId}\`;
  const winningVariant = getCookie(cookieName);
  const parentDiv = document.currentScript?.parentElement;
  const isDefaultContent = variantContentId === defaultContentId;
  const isWinningVariant = winningVariant === variantContentId;

  console.log({
    isWinningVariant,
    isDefaultContent,
    variantContentId,
  })


  /**
   * For Hydration frameworks, we need to remove the node if it's not the winning variant.
   */
  if (isHydrationTarget) {
    if (!isWinningVariant) {
      parentDiv?.remove();
    }

    const thisScriptEl = document.currentScript;
    thisScriptEl?.remove();
  } else if (!isHydrationTarget) {
    /**
     * For non-hydration frameworks, we need to
     *  - hide the default variant if it's not the winning variant.
     *  - show non-default variant if it is the winning variant.
     */
    if (isWinningVariant && !isDefaultContent) {
      parentDiv?.removeAttribute('hidden');
      parentDiv?.removeAttribute('aria-hidden');
    } else if (!isWinningVariant && isDefaultContent) {
      parentDiv?.setAttribute('hidden', 'true');
      parentDiv?.setAttribute('aria-hidden', 'true');
    }
  }
  return;
  
}`;
