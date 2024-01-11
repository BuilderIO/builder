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
import cssToStyleSheet from "css-to-react-native";
import { ALLOWED_CSS_PROPERTIES } from "./sanitize-rn-allowed-css";
const DISPLAY_VALUES = ["flex", "none"];
function omit(obj, ...values) {
  const newObject = Object.assign({}, obj);
  for (const key of values) {
    delete newObject[key];
  }
  return newObject;
}
const inRange = (value, min, max) => value >= min && value <= max;
const processValue = (styles, [key, value]) => {
  if (!ALLOWED_CSS_PROPERTIES.includes(key)) return void 0;
  if (value.includes("calc")) return void 0;
  if (value.includes("inherit")) return void 0;
  if (value === "px") return void 0;
  if (key === "display" && !DISPLAY_VALUES.includes(value)) return void 0;
  if (key === "maxWidth" && value === "none") {
    return "100%";
  }
  if (key === "lineHeight" && !value.includes("px")) {
    const fontSize = parseFloat(styles.fontSize);
    const lineHeight = parseFloat(styles.lineHeight);
    if (!isNaN(fontSize) && !isNaN(lineHeight) && inRange(lineHeight, 1, 2)) {
      return `${Math.round(fontSize * lineHeight)}px`;
    }
    return void 0;
  }
  if (key === "fontFamily") {
    return value.replace(/["]/g, "").split(",")[0];
  }
  const numericValue = parseFloat(value);
  const isNumeric = !isNaN(numericValue);
  if (isNumeric) {
    const processSuffix = numAsStr => {
      if (numAsStr.includes("em")) {
        if (key === "letterSpacing") return numAsStr.replace("em", "px");
        return numAsStr.replace("em", "");
      }
      if (numAsStr.includes("pt")) return numericValue;
      if (numAsStr.includes("px")) return numericValue;
      if (numAsStr.includes("vw")) return numAsStr.replace("vw", "%");
      if (numAsStr.includes("vh")) return numAsStr.replace("vh", "%");
      return numericValue;
    };
    return processSuffix(value);
  }
  return value;
};
const cleanCssStyleProps = styles => Object.entries(styles).reduce((acc, [key, value]) => {
  const processedValue = processValue(styles, [key, value]);
  if (processedValue === void 0) return acc;
  return __spreadProps(__spreadValues({}, acc), {
    [key]: processedValue
  });
}, {});
const removeDisplayNone = styles => styles.display === "none" ? omit(styles, "display") : styles;
const responsiveStylesToStyleSheet = responsiveStyles => {
  const large = (responsiveStyles == null ? void 0 : responsiveStyles.large) || {};
  const medium = (responsiveStyles == null ? void 0 : responsiveStyles.medium) || {};
  const small = (responsiveStyles == null ? void 0 : responsiveStyles.small) || {};
  const filtered = removeDisplayNone(__spreadValues(__spreadValues({}, large), medium));
  const css = __spreadValues(__spreadValues({}, filtered), small);
  const cleanedCss = cleanCssStyleProps(css);
  return cssToStyleSheet(Object.entries(cleanedCss));
};
export { cleanCssStyleProps, responsiveStylesToStyleSheet }