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

var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = value => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };

    var rejected = value => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };

    var step = x => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

    step((generator = generator.apply(__this, __arguments)).next());
  });
};

import { getBuilderSearchParams } from "./get-builder-search-params/index.js";
import { fetchOneEntry } from "./get-content/index.js";

const fetchBuilderProps = _args => __async(void 0, null, function* () {
  var _a, _b, _c;

  const urlPath = _args.path || ((_a = _args.url) == null ? void 0 : _a.pathname) || ((_b = _args.userAttributes) == null ? void 0 : _b.urlPath);

  const getContentArgs = __spreadProps(__spreadValues({}, _args), {
    apiKey: _args.apiKey,
    model: _args.model || "page",
    userAttributes: __spreadValues(__spreadValues({}, _args.userAttributes), urlPath ? {
      urlPath
    } : {}),
    options: getBuilderSearchParams(_args.searchParams || ((_c = _args.url) == null ? void 0 : _c.searchParams) || _args.options)
  });

  return {
    apiKey: getContentArgs.apiKey,
    model: getContentArgs.model,
    content: yield fetchOneEntry(getContentArgs)
  };
});

export { fetchBuilderProps }