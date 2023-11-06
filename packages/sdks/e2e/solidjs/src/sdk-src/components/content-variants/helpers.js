var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;

var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;

var __spreadValues = (a, b) => {
  for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);

  if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)) {
    if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  }
  return a;
};

var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

import { TARGET } from "../../constants/target.js";
import { isBrowser } from "../../functions/is-browser.js";

const getVariants = content => Object.values((content == null ? void 0 : content.variations) || {}).map(variant => __spreadProps(__spreadValues({}, variant), {
  testVariationId: variant.id,
  id: content == null ? void 0 : content.id
}));

const checkShouldRunVariants = ({
  canTrack,
  content
}) => {
  const hasVariants = getVariants(content).length > 0;
  if (TARGET === "reactNative") return false;
  if (!hasVariants) return false;
  if (!canTrack) return false;
  if (TARGET === "vue2" || TARGET === "vue3") return true;
  if (isBrowser()) return false;
  return true;
};

function bldrAbTest(contentId, variants, isHydrationTarget2) {
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

  if (isHydrationTarget2) {
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

function bldrCntntScrpt(variantContentId, defaultContentId, isHydrationTarget2) {
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
  const variantId = getCookie(cookieName);
  const parentDiv = (_a = document.currentScript) == null ? void 0 : _a.parentElement;
  const variantIsDefaultContent = variantContentId === defaultContentId;

  if (variantId === variantContentId) {
    if (variantIsDefaultContent) {
      return;
    }

    parentDiv == null ? void 0 : parentDiv.removeAttribute("hidden");
    parentDiv == null ? void 0 : parentDiv.removeAttribute("aria-hidden");
  } else {
    if (variantIsDefaultContent) {
      if (isHydrationTarget2) {
        parentDiv == null ? void 0 : parentDiv.remove();
      } else {
        parentDiv == null ? void 0 : parentDiv.setAttribute("hidden", "true");
        parentDiv == null ? void 0 : parentDiv.setAttribute("aria-hidden", "true");
      }
    }

    return;
  }

  return;
}

const getIsHydrationTarget = target => target === "react" || target === "reactNative";

const isHydrationTarget = getIsHydrationTarget(TARGET);
const AB_TEST_FN_NAME = "builderIoAbTest";
const CONTENT_FN_NAME = "builderIoRenderContent";

const getScriptString = () => {
  const fnStr = bldrAbTest.toString().replace(/\s+/g, " ");
  const fnStr2 = bldrCntntScrpt.toString().replace(/\s+/g, " ");
  return `
  window.${AB_TEST_FN_NAME} = ${fnStr}
  window.${CONTENT_FN_NAME} = ${fnStr2}
  `;
};

const getVariantsScriptString = (variants, contentId) => {
  return `
  window.${AB_TEST_FN_NAME}("${contentId}",${JSON.stringify(variants)}, ${isHydrationTarget})`;
};

const getRenderContentScriptString = ({
  contentId,
  variationId
}) => {
  return `
  window.${CONTENT_FN_NAME}("${variationId}", "${contentId}", ${isHydrationTarget})`;
};

export { checkShouldRunVariants, getRenderContentScriptString, getScriptString, getVariants, getVariantsScriptString }