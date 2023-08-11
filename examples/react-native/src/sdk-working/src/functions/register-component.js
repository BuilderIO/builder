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
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
import { serializeFn } from "../blocks/util.js";
import { fastClone } from "./fast-clone.js";
const components = [];
function registerComponent(component, info) {
  components.push(__spreadValues({ component }, info));
  console.warn("registerComponent is deprecated. Use the `customComponents` prop in RenderContent instead to provide your custom components to the builder SDK.");
  return component;
}
const createRegisterComponentMessage = (_a) => {
  var _b = _a, {
    component: _
  } = _b, info = __objRest(_b, [
    "component"
  ]);
  return {
    type: "builder.registerComponent",
    data: prepareComponentInfoToSend(info)
  };
};
const serializeValue = (value) => typeof value === "function" ? serializeFn(value) : fastClone(value);
const prepareComponentInfoToSend = (_c) => {
  var _d = _c, {
    inputs
  } = _d, info = __objRest(_d, [
    "inputs"
  ]);
  return __spreadProps(__spreadValues({}, fastClone(info)), {
    inputs: inputs == null ? void 0 : inputs.map((input) => Object.entries(input).reduce((acc, [key, value]) => __spreadProps(__spreadValues({}, acc), {
      [key]: serializeValue(value)
    }), {}))
  });
};
export {
  components,
  createRegisterComponentMessage,
  registerComponent
};
