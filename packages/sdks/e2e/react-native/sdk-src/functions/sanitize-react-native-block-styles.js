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
import { logger } from "../helpers/logger";
const propertiesThatMustBeNumber = new Set(["lineHeight"]);
const displayValues = new Set(["flex", "none"]);
const normalizeNumber = value => {
  if (Number.isNaN(value)) return void 0;
  return value;
};
const sanitizeStringProperty = value => {
  const isPixelUnit = value.match(/^-?(\d*)(\.?)(\d*)*px$/);
  const parsedValue = normalizeNumber(parseFloat(value));
  if (!parsedValue) return value;
  if (isPixelUnit) return parsedValue < 0 ? 0 : parsedValue;
  return parsedValue;
};
const sanitizeReactNativeBlockStyles = styles => {
  return Object.keys(styles).reduce((acc, key) => {
    const propertyValue = styles[key];
    if (key === "display" && !displayValues.has(propertyValue)) {
      logger.warn(`Style key "display" must be "flex" or "none", but had value: "${propertyValue}".`);
      return acc;
    }
    if (propertiesThatMustBeNumber.has(key) && typeof propertyValue !== "number") {
      logger.warn(`Style key "${key}" must be a number, but had value: "${styles[key]}".`);
      return acc;
    }
    if (key === "margin" || key === "padding") {
      const values = propertyValue.toString().split(" ").map(sanitizeStringProperty).filter(x => {
        if (x === void 0) {
          logger.warn(`Style key "${key}" had an invalid value: "${x}" within "${propertyValue}".`);
        }
        return x !== void 0;
      });
      if (values.length === 1) {
        return __spreadProps(__spreadValues({}, acc), {
          [`${key}Top`]: values[0],
          [`${key}Right`]: values[0],
          [`${key}Bottom`]: values[0],
          [`${key}Left`]: values[0]
        });
      } else if (values.length === 2) {
        return __spreadProps(__spreadValues({}, acc), {
          [`${key}Top`]: values[0],
          [`${key}Right`]: values[1],
          [`${key}Bottom`]: values[0],
          [`${key}Left`]: values[1]
        });
      } else if (values.length === 3) {
        return __spreadProps(__spreadValues({}, acc), {
          [`${key}Top`]: values[0],
          [`${key}Right`]: values[1],
          [`${key}Bottom`]: values[2],
          [`${key}Left`]: values[1]
        });
      } else if (values.length === 4) {
        return __spreadProps(__spreadValues({}, acc), {
          [`${key}Top`]: values[0],
          [`${key}Right`]: values[1],
          [`${key}Bottom`]: values[2],
          [`${key}Left`]: values[3]
        });
      } else {
        logger.warn(`Style key "${key}" must have 1-4 values, but had value: "${styles[key]}".`);
        return acc;
      }
    }
    if (typeof propertyValue === "string") {
      const sanitizedVal = sanitizeStringProperty(propertyValue);
      if (sanitizedVal === void 0) {
        logger.warn(`Style key "${key}" had an invalid value: "${propertyValue}".`);
        return acc;
      }
      return __spreadProps(__spreadValues({}, acc), {
        [key]: sanitizedVal
      });
    }
    return __spreadProps(__spreadValues({}, acc), {
      [key]: propertyValue
    });
  }, {});
};
export { sanitizeReactNativeBlockStyles }