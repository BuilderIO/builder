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
import { evaluate } from "./evaluate";
import { fastClone } from "./fast-clone.js";
import { set } from "./set.js";
import { transformBlock } from "./transform-block.js";
const evaluateBindings = ({
  block,
  context,
  localState,
  rootState,
  rootSetState
}) => {
  if (!block.bindings) {
    return block;
  }
  const copy = fastClone(block);
  const copied = __spreadProps(__spreadValues({}, copy), {
    properties: __spreadValues({}, copy.properties),
    actions: __spreadValues({}, copy.actions)
  });
  for (const binding in block.bindings) {
    const expression = block.bindings[binding];
    const value = evaluate({
      code: expression,
      localState,
      rootState,
      rootSetState,
      context
    });
    set(copied, binding, value);
  }
  return copied;
};
function getProcessedBlock({
  block,
  context,
  shouldEvaluateBindings,
  localState,
  rootState,
  rootSetState
}) {
  const transformedBlock = transformBlock(block);
  if (shouldEvaluateBindings) {
    return evaluateBindings({
      block: transformedBlock,
      localState,
      rootState,
      rootSetState,
      context
    });
  } else {
    return transformedBlock;
  }
}
export { getProcessedBlock }