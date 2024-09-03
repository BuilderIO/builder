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

/**
 * For more information on how this works,
 * see our [SSR A/B Test Docs](https://github.com/BuilderIO/builder/tree/main/packages/sdks/docs/SSR_AB_TEST.md)
 */

export const UPDATE_COOKIES_AND_STYLES_SCRIPT = "function updateCookiesAndStyles(contentId, variants, isHydrationTarget) {\n  function getAndSetVariantId() {\n    function setCookie(name, value, days) {\n      let expires = '';\n      if (days) {\n        const date = new Date();\n        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);\n        expires = '; expires=' + date.toUTCString();\n      }\n      document.cookie = name + '=' + (value || '') + expires + '; path=/' + '; Secure; SameSite=None';\n    }\n    function getCookie(name) {\n      const nameEQ = name + '=';\n      const ca = document.cookie.split(';');\n      for (let i = 0; i < ca.length; i++) {\n        let c = ca[i];\n        while (c.charAt(0) === ' ') c = c.substring(1, c.length);\n        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);\n      }\n      return null;\n    }\n    const cookieName = `builder.tests.${contentId}`;\n    const variantInCookie = getCookie(cookieName);\n    const availableIDs = variants.map(vr => vr.id).concat(contentId);\n    if (variantInCookie && availableIDs.includes(variantInCookie)) {\n      return variantInCookie;\n    }\n    let n = 0;\n    const random = Math.random();\n    for (let i = 0; i < variants.length; i++) {\n      const variant = variants[i];\n      const testRatio = variant.testRatio;\n      n += testRatio;\n      if (random < n) {\n        setCookie(cookieName, variant.id);\n        return variant.id;\n      }\n    }\n    setCookie(cookieName, contentId);\n    return contentId;\n  }\n  const winningVariantId = getAndSetVariantId();\n  const styleEl = document.currentScript?.previousElementSibling;\n  if (isHydrationTarget) {\n    styleEl.remove();\n    const thisScriptEl = document.currentScript;\n    thisScriptEl?.remove();\n  } else {\n    const newStyleStr = variants.concat({\n      id: contentId\n    }).filter(variant => variant.id !== winningVariantId).map(value => {\n      return `.variant-${value.id} {  display: none; }\n        `;\n    }).join('');\n    styleEl.innerHTML = newStyleStr;\n  }\n}";
export const UPDATE_VARIANT_VISIBILITY_SCRIPT = "function updateVariantVisibility(variantContentId, defaultContentId, isHydrationTarget) {\n  if (!navigator.cookieEnabled) {\n    return;\n  }\n  function getCookie(name) {\n    const nameEQ = name + '=';\n    const ca = document.cookie.split(';');\n    for (let i = 0; i < ca.length; i++) {\n      let c = ca[i];\n      while (c.charAt(0) === ' ') c = c.substring(1, c.length);\n      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);\n    }\n    return null;\n  }\n  const cookieName = `builder.tests.${defaultContentId}`;\n  const winningVariant = getCookie(cookieName);\n  const parentDiv = document.currentScript?.parentElement;\n  const isDefaultContent = variantContentId === defaultContentId;\n  const isWinningVariant = winningVariant === variantContentId;\n  if (isWinningVariant && !isDefaultContent) {\n    parentDiv?.removeAttribute('hidden');\n    parentDiv?.removeAttribute('aria-hidden');\n  } else if (!isWinningVariant && isDefaultContent) {\n    parentDiv?.setAttribute('hidden', 'true');\n    parentDiv?.setAttribute('aria-hidden', 'true');\n  }\n  if (isHydrationTarget) {\n    if (!isWinningVariant) {\n      parentDiv?.remove();\n    }\n    const thisScriptEl = document.currentScript;\n    thisScriptEl?.remove();\n  }\n  return;\n}";