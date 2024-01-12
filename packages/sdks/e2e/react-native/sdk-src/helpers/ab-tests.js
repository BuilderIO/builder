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
import { TARGET } from "../constants/target.js";
import { checkIsDefined } from "../helpers/nullable.js";
import { getCookie, getCookieSync, setCookie } from "./cookie.js";
import { logger } from "./logger.js";
const BUILDER_STORE_PREFIX = "builder.tests";
const getContentTestKey = id => `${BUILDER_STORE_PREFIX}.${id}`;
const getContentVariationCookie = ({
  contentId
}) => getCookie({
  name: getContentTestKey(contentId),
  canTrack: true
});
const getContentVariationCookieSync = ({
  contentId
}) => getCookieSync({
  name: getContentTestKey(contentId),
  canTrack: true
});
const setContentVariationCookie = ({
  contentId,
  value
}) => setCookie({
  name: getContentTestKey(contentId),
  value,
  canTrack: true
});
const checkIsBuilderContentWithVariations = item => checkIsDefined(item.id) && checkIsDefined(item.variations) && Object.keys(item.variations).length > 0;
const getRandomVariationId = ({
  id,
  variations
}) => {
  var _a;
  let n = 0;
  const random = Math.random();
  for (const id2 in variations) {
    const testRatio = (_a = variations[id2]) == null ? void 0 : _a.testRatio;
    n += testRatio;
    if (random < n) {
      return id2;
    }
  }
  return id;
};
const getAndSetVariantId = args => {
  const randomVariationId = getRandomVariationId(args);
  setContentVariationCookie({
    contentId: args.id,
    value: randomVariationId
  }).catch(err => {
    logger.error("could not store A/B test variation: ", err);
  });
  return randomVariationId;
};
const getTestFields = ({
  item,
  testGroupId
}) => {
  const variationValue = item.variations[testGroupId];
  if (testGroupId === item.id || !variationValue) {
    return {
      testVariationId: item.id,
      testVariationName: "Default"
    };
  } else {
    return {
      data: variationValue.data,
      testVariationId: variationValue.id,
      testVariationName: variationValue.name || (variationValue.id === item.id ? "Default" : "")
    };
  }
};
const handleABTestingSync = ({
  item,
  canTrack
}) => {
  if (TARGET === "reactNative") return item;
  if (!canTrack) {
    return item;
  }
  if (!item) {
    return void 0;
  }
  if (!checkIsBuilderContentWithVariations(item)) {
    return item;
  }
  const testGroupId = getContentVariationCookieSync({
    contentId: item.id
  }) || getAndSetVariantId({
    variations: item.variations,
    id: item.id
  });
  const variationValue = getTestFields({
    item,
    testGroupId
  });
  return __spreadValues(__spreadValues({}, item), variationValue);
};
const handleABTesting = _0 => __async(void 0, [_0], function* ({
  item,
  canTrack
}) {
  if (!canTrack) {
    return item;
  }
  if (!checkIsBuilderContentWithVariations(item)) {
    return item;
  }
  const cookieValue = yield getContentVariationCookie({
    contentId: item.id
  });
  const testGroupId = cookieValue || getAndSetVariantId({
    variations: item.variations,
    id: item.id
  });
  const variationValue = getTestFields({
    item,
    testGroupId
  });
  return __spreadValues(__spreadValues({}, item), variationValue);
});
export { handleABTesting, handleABTestingSync }