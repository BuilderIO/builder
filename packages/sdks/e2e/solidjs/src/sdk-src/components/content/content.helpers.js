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
  (_b = (_a = content == null ? void 0 : content.data) == null ? void 0 : _a.inputs) == null ? void 0 : _b.forEach(input => {
    var _a2;

    if (input.name && input.defaultValue !== void 0 && ((_a2 = content == null ? void 0 : content.data) == null ? void 0 : _a2.state) && content.data.state[input.name] === void 0) {
      defaultValues[input.name] = input.defaultValue;
    }
  });

  const stateToUse = __spreadValues(__spreadValues(__spreadValues({}, (_c = content == null ? void 0 : content.data) == null ? void 0 : _c.state), data), locale ? {
    locale
  } : {});

  return __spreadValues(__spreadValues({}, defaultValues), stateToUse);
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