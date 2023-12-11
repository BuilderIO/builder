/**
 * For more information on how this works,
 * see our [SSR A/B Test Docs](https://github.com/BuilderIO/builder/tree/main/packages/sdks/src/SSR_AB_TEST.md)
 */

/**
 * For more information on how this works,
 * see our [SSR A/B Test Docs](https://github.com/BuilderIO/builder/tree/main/packages/sdks/src/SSR_AB_TEST.md)
 */

export const UPDATE_COOKIES_AND_STYLES_SCRIPT = `function updateCookiesAndStyles(contentId, variants, isHydrationTarget) {
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
export const UPDATE_VARIANT_VISIBILITY_SCRIPT = `function updateVariantVisibility(variantContentId, defaultContentId, isHydrationTarget) {
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
  
  if (isWinningVariant && !isDefaultContent) {
    console.log('removing hidden attribute', variantContentId)
      parentDiv?.removeAttribute('hidden');
    parentDiv?.removeAttribute('aria-hidden');
    return;
  } else if (!isWinningVariant && isDefaultContent) {
    console.log('setting hidden attribute', variantContentId)
      parentDiv?.setAttribute('hidden', 'true');
    parentDiv?.setAttribute('aria-hidden', 'true');
  }
  if (isHydrationTarget) {
      if (!isWinningVariant) {
        console.log('removing losing variant', variantContentId)
        parentDiv?.remove();
    }

    console.log('removin script itself', variantContentId)
    const thisScriptEl = document.currentScript;
    // thisScriptEl?.remove();
  }
  return;
}`;
