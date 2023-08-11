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
import {
  getContentVariationCookie,
  setContentVariationCookie
} from "../../helpers/ab-tests.js";
import { checkIsDefined } from "../../helpers/nullable.js";
const checkIsBuilderContentWithVariations = (item) => checkIsDefined(item.id) && checkIsDefined(item.variations) && Object.keys(item.variations).length > 0;
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
const getContentVariation = (_0) => __async(void 0, [_0], function* ({
  item,
  canTrack
}) {
  const testGroupId = yield getContentVariationCookie({
    canTrack,
    contentId: item.id
  });
  const testFields = testGroupId ? getTestFields({ item, testGroupId }) : void 0;
  if (testFields) {
    return testFields;
  } else {
    const randomVariationId = getRandomVariationId({
      variations: item.variations,
      id: item.id
    });
    setContentVariationCookie({
      contentId: item.id,
      value: randomVariationId,
      canTrack
    }).catch((err) => {
      console.error("could not store A/B test variation: ", err);
    });
    return getTestFields({ item, testGroupId: randomVariationId });
  }
});
const handleABTesting = (_0) => __async(void 0, [_0], function* ({
  item,
  canTrack
}) {
  if (!checkIsBuilderContentWithVariations(item)) {
    return;
  }
  const variationValue = yield getContentVariation({ item, canTrack });
  Object.assign(item, variationValue);
});
export {
  handleABTesting
};
