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

const propertiesThatMustBeNumber = new Set(["lineHeight"]);
const displayValues = new Set(["flex", "none"]);
const SHOW_WARNINGS = false;

const normalizeNumber = value => {
  if (Number.isNaN(value)) {
    return void 0;
  } else if (value < 0) {
    return 0;
  } else {
    return value;
  }
};

const sanitizeReactNativeBlockStyles = styles => {
  return Object.keys(styles).reduce((acc, key) => {
    const propertyValue = styles[key];

    if (key === "display" && !displayValues.has(propertyValue)) {
      if (SHOW_WARNINGS) {
        console.warn(`Style value for key "display" must be "flex" or "none" but had ${propertyValue}`);
      }

      return acc;
    }

    if (propertiesThatMustBeNumber.has(key) && typeof propertyValue !== "number") {
      if (SHOW_WARNINGS) {
        console.warn(`Style key ${key} must be a number, but had value \`${styles[key]}\``);
      }

      return acc;
    }

    if (typeof propertyValue === "string") {
      const isPixelUnit = propertyValue.match(/^-?(\d*)(\.?)(\d*)*px$/);

      if (isPixelUnit) {
        const newValue = parseFloat(propertyValue);
        const normalizedValue = normalizeNumber(newValue);

        if (normalizedValue) {
          return __spreadProps(__spreadValues({}, acc), {
            [key]: normalizedValue
          });
        } else {
          return acc;
        }
      } else if (propertyValue === "0") {
        return __spreadProps(__spreadValues({}, acc), {
          [key]: 0
        });
      }
    }

    return __spreadProps(__spreadValues({}, acc), {
      [key]: propertyValue
    });
  }, {});
};

export { sanitizeReactNativeBlockStyles }