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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { logger } from "../../helpers/logger.js";
import { fetch } from "../get-fetch.js";
import { handleABTesting } from "./ab-testing.js";
import { generateContentUrl } from "./generate-content-url.js";
function getContent(options) {
  return __async(this, null, function* () {
    const allContent = yield getAllContent(__spreadProps(__spreadValues({}, options), { limit: 1 }));
    if (allContent && "results" in allContent) {
      return (allContent == null ? void 0 : allContent.results[0]) || null;
    }
    return null;
  });
}
function getAllContent(options) {
  return __async(this, null, function* () {
    try {
      const url = generateContentUrl(options);
      const res = yield fetch(url.href);
      const content = yield res.json();
      if ("status" in content && !("results" in content)) {
        logger.error("Error fetching data. ", { url, content, options });
        return content;
      }
      const canTrack = options.canTrack !== false;
      try {
        if (canTrack && Array.isArray(content.results)) {
          for (const item of content.results) {
            yield handleABTesting({ item, canTrack });
          }
        }
      } catch (e) {
        logger.error("Could not setup A/B testing. ", e);
      }
      return content;
    } catch (error) {
      logger.error("Error fetching data. ", error);
      return null;
    }
  });
}
export {
  getAllContent,
  getContent
};
