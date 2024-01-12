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
import { UPDATE_COOKIES_AND_STYLES_SCRIPT, UPDATE_VARIANT_VISIBILITY_SCRIPT } from "./inlined-fns.js";
const UPDATE_COOKIES_AND_STYLES_SCRIPT_NAME = "builderIoAbTest";
const UPDATE_VARIANT_VISIBILITY_SCRIPT_FN_NAME = "builderIoRenderContent";
const getVariants = content => Object.values((content == null ? void 0 : content.variations) || {}).map(variant => __spreadProps(__spreadValues({}, variant), {
  testVariationId: variant.id,
  id: content == null ? void 0 : content.id
}));
const checkShouldRenderVariants = ({
  canTrack,
  content
}) => {
  const hasVariants = getVariants(content).length > 0;
  if (TARGET === "reactNative") return false;
  if (!hasVariants) return false;
  if (!canTrack) return false;
  if (TARGET === "vue2" || TARGET === "vue3" || TARGET === "svelte") return true;
  if (isBrowser()) return false;
  return true;
};
const getIsHydrationTarget = target => target === "react" || target === "reactNative";
const isHydrationTarget = getIsHydrationTarget(TARGET);
const getScriptString = () => `
  window.${UPDATE_COOKIES_AND_STYLES_SCRIPT_NAME} = ${UPDATE_COOKIES_AND_STYLES_SCRIPT}
  window.${UPDATE_VARIANT_VISIBILITY_SCRIPT_FN_NAME} = ${UPDATE_VARIANT_VISIBILITY_SCRIPT}
  `;
const getUpdateCookieAndStylesScript = (variants, contentId) => `
  window.${UPDATE_COOKIES_AND_STYLES_SCRIPT_NAME}(
    "${contentId}",${JSON.stringify(variants)}, ${isHydrationTarget}
  )`;
const getUpdateVariantVisibilityScript = ({
  contentId,
  variationId
}) => `window.${UPDATE_VARIANT_VISIBILITY_SCRIPT_FN_NAME}(
    "${variationId}", "${contentId}", ${isHydrationTarget}
  )`;
export { checkShouldRenderVariants, getScriptString, getUpdateCookieAndStylesScript, getUpdateVariantVisibilityScript, getVariants }