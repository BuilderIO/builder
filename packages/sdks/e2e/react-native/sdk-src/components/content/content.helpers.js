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
const getContextStateInitialValue = ({
  content,
  data,
  locale
}) => {
  var _a, _b, _c;
  const defaultValues = {};
  const initialState = ((_a = content == null ? void 0 : content.data) == null ? void 0 : _a.state) || {};
  (_c = (_b = content == null ? void 0 : content.data) == null ? void 0 : _b.inputs) == null ? void 0 : _c.forEach(input => {
    if (input.name && input.defaultValue !== void 0) {
      defaultValues[input.name] = input.defaultValue;
    }
  });
  return __spreadValues(__spreadValues(__spreadValues(__spreadValues({}, defaultValues), initialState), data), locale ? {
    locale
  } : {});
};
const getContentInitialValue = ({
  content,
  data
}) => {
  return !content ? void 0 : __spreadProps(__spreadValues({}, content), {
    data: __spreadValues(__spreadValues({}, content == null ? void 0 : content.data), data),
    meta: content == null ? void 0 : content.meta
  });
};
export { getContentInitialValue, getContextStateInitialValue }