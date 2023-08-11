var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { TARGET } from "../constants/target.js";
import { convertStyleMapToCSSArray } from "../helpers/css.js";
import { transformBlockProperties } from "./transform-block-properties.js";
const extractRelevantRootBlockProperties = (block) => {
  return { href: block.href };
};
function getBlockProperties(block) {
  var _a;
  const properties = __spreadProps(__spreadValues(__spreadValues({}, extractRelevantRootBlockProperties(block)), block.properties), {
    "builder-id": block.id,
    style: getStyleAttribute(block.style),
    class: [block.id, "builder-block", block.class, (_a = block.properties) == null ? void 0 : _a.class].filter(Boolean).join(" ")
  });
  return transformBlockProperties(properties);
}
function getStyleAttribute(style) {
  if (!style) {
    return void 0;
  }
  switch (TARGET) {
    case "svelte":
    case "vue2":
    case "vue3":
    case "solid":
      return convertStyleMapToCSSArray(style).join(" ");
    case "qwik":
    case "reactNative":
    case "react":
      return style;
  }
}
export {
  getBlockProperties
};
