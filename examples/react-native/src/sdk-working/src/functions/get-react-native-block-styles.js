var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
import { sanitizeReactNativeBlockStyles } from "./sanitize-react-native-block-styles.js";
function getReactNativeBlockStyles({
  block,
  context,
  blockStyles
}) {
  const responsiveStyles = block.responsiveStyles;
  if (!responsiveStyles) {
    return {};
  }
  const styles = __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, context.inheritedStyles), responsiveStyles.large || {}), responsiveStyles.medium || {}), responsiveStyles.small || {}), blockStyles);
  const newStyles = sanitizeReactNativeBlockStyles(styles);
  return newStyles;
}
export {
  getReactNativeBlockStyles
};
