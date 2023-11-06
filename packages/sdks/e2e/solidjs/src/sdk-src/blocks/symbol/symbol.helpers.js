var __defProp = Object.defineProperty;
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

import { logger } from "../../helpers/logger.js";
import { fetchOneEntry } from "../../index.js";

const fetchSymbolContent = _0 => __async(void 0, [_0], function* ({
  builderContextValue,
  symbol
}) {
  if ((symbol == null ? void 0 : symbol.model) && (builderContextValue == null ? void 0 : builderContextValue.apiKey)) {
    return fetchOneEntry(__spreadValues({
      model: symbol.model,
      apiKey: builderContextValue.apiKey,
      apiVersion: builderContextValue.apiVersion
    }, (symbol == null ? void 0 : symbol.entry) && {
      query: {
        id: symbol.entry
      }
    })).catch(err => {
      logger.error("Could not fetch symbol content: ", err);
      return void 0;
    });
  }

  return void 0;
});

export { fetchSymbolContent }