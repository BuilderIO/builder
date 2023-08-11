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
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source) if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0) target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols) for (var prop of __getOwnPropSymbols(source)) {
    if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop)) target[prop] = source[prop];
  }
  return target;
};
import { evaluate } from "../../functions/evaluate";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
const EMPTY_HTML_ELEMENTS = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
const isEmptyHtmlElement = tagName => {
  return typeof tagName === "string" && EMPTY_HTML_ELEMENTS.includes(tagName.toLowerCase());
};
const getComponent = ({
  block,
  context,
  registeredComponents
}) => {
  var _a;
  const componentName = (_a = getProcessedBlock({
    block,
    localState: context.localState,
    rootState: context.rootState,
    rootSetState: context.rootSetState,
    context: context.context,
    shouldEvaluateBindings: false
  }).component) == null ? void 0 : _a.name;
  if (!componentName) {
    return null;
  }
  const ref = registeredComponents[componentName];
  if (!ref) {
    console.warn(`
      Could not find a registered component named "${componentName}". 
      If you registered it, is the file that registered it imported by the file that needs to render it?`);
    return void 0;
  } else {
    return ref;
  }
};
const getRepeatItemData = ({
  block,
  context
}) => {
  const _a = block,
    {
      repeat
    } = _a,
    blockWithoutRepeat = __objRest(_a, ["repeat"]);
  if (!(repeat == null ? void 0 : repeat.collection)) {
    return void 0;
  }
  const itemsArray = evaluate({
    code: repeat.collection,
    localState: context.localState,
    rootState: context.rootState,
    rootSetState: context.rootSetState,
    context: context.context
  });
  if (!Array.isArray(itemsArray)) {
    return void 0;
  }
  const collectionName = repeat.collection.split(".").pop();
  const itemNameToUse = repeat.itemName || (collectionName ? collectionName + "Item" : "item");
  const repeatArray = itemsArray.map((item, index) => ({
    context: __spreadProps(__spreadValues({}, context), {
      localState: __spreadProps(__spreadValues({}, context.localState), {
        $index: index,
        $item: item,
        [itemNameToUse]: item,
        [`$${itemNameToUse}Index`]: index
      })
    }),
    block: blockWithoutRepeat
  }));
  return repeatArray;
};
export { getComponent, getRepeatItemData, isEmptyHtmlElement }