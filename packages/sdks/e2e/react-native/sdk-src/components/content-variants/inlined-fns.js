function updateCookiesAndStyles(contentId, variants, isHydrationTarget) {
  var _a;
  function getAndSetVariantId() {
    function setCookie(name, value, days) {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1e3);
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/; Secure; SameSite=None";
    }
    function getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
    const cookieName = `builder.tests.${contentId}`;
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
  const styleEl = (_a = document.currentScript) == null ? void 0 : _a.previousElementSibling;
  if (isHydrationTarget) {
    styleEl.remove();
    const thisScriptEl = document.currentScript;
    thisScriptEl == null ? void 0 : thisScriptEl.remove();
  } else {
    const newStyleStr = variants.concat({
      id: contentId
    }).filter(variant => variant.id !== winningVariantId).map(value => {
      return `.variant-${value.id} {  display: none; }
        `;
    }).join("");
    styleEl.innerHTML = newStyleStr;
  }
}
function updateVariantVisibility(variantContentId, defaultContentId, isHydrationTarget) {
  var _a;
  if (!navigator.cookieEnabled) {
    return;
  }
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  const cookieName = `builder.tests.${defaultContentId}`;
  const winningVariant = getCookie(cookieName);
  const parentDiv = (_a = document.currentScript) == null ? void 0 : _a.parentElement;
  const isDefaultContent = variantContentId === defaultContentId;
  const isWinningVariant = winningVariant === variantContentId;
  if (isWinningVariant && !isDefaultContent) {
    parentDiv == null ? void 0 : parentDiv.removeAttribute("hidden");
    parentDiv == null ? void 0 : parentDiv.removeAttribute("aria-hidden");
  } else if (!isWinningVariant && isDefaultContent) {
    parentDiv == null ? void 0 : parentDiv.setAttribute("hidden", "true");
    parentDiv == null ? void 0 : parentDiv.setAttribute("aria-hidden", "true");
  }
  if (isHydrationTarget) {
    if (!isWinningVariant) {
      parentDiv == null ? void 0 : parentDiv.remove();
    }
    const thisScriptEl = document.currentScript;
    thisScriptEl == null ? void 0 : thisScriptEl.remove();
  }
  return;
}
const UPDATE_COOKIES_AND_STYLES_SCRIPT = updateCookiesAndStyles.toString().replace(/\s+/g, " ");
const UPDATE_VARIANT_VISIBILITY_SCRIPT = updateVariantVisibility.toString().replace(/\s+/g, " ");
export { UPDATE_COOKIES_AND_STYLES_SCRIPT, UPDATE_VARIANT_VISIBILITY_SCRIPT }