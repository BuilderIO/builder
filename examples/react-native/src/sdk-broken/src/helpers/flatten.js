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
function flatten(object, path = null, separator = ".") {
  return Object.keys(object).reduce((acc, key) => {
    const value = object[key];
    const newPath = [path, key].filter(Boolean).join(separator);
    const isObject = [typeof value === "object", value !== null, !(Array.isArray(value) && value.length === 0)].every(Boolean);
    return isObject ? __spreadValues(__spreadValues({}, acc), flatten(value, newPath, separator)) : __spreadProps(__spreadValues({}, acc), {
      [newPath]: value
    });
  }, {});
}
export { flatten }