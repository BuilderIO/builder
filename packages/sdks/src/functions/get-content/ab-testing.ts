import { BuilderContent } from '../../types/builder-content.js';
import {
  getContentVariationCookie,
  setContentVariationCookie,
} from '../../helpers/ab-tests.js';

const getRandomTestGroupId = (
  variations: NonNullable<BuilderContent['variations']>
) => {
  let n = 0;
  const random = Math.random();
  for (const id in variations) {
    const testRatio = variations[id].testRatio;
    n += testRatio!;

    if (random < n) {
      return id;
    }
  }

  return undefined;
};

const getContentVariation = async (item: BuilderContent) => {
  if (
    !item.id ||
    !item.variations ||
    Object.keys(item.variations).length === 0
  ) {
    return;
  }

  // try to find test variation in cookies/storage
  const testGroupId = await getContentVariationCookie({
    canTrack: true,
    contentId: item.id,
  });
  const variationValue = testGroupId ? item.variations[testGroupId] : undefined;

  if (variationValue) {
    return variationValue;
  } else {
    // generate a random ID for this user and store it in cookies/storage
    const randomTestGroupId = getRandomTestGroupId(item.variations);

    if (randomTestGroupId) {
      await setContentVariationCookie({
        contentId: item.id,
        value: randomTestGroupId,
        canTrack: true,
      });
    }

    const randomVariationValue = randomTestGroupId
      ? item.variations[randomTestGroupId]
      : undefined;

    return randomVariationValue;
  }
};

export const handleABTesting = async (item: BuilderContent) => {
  const variationValue = await getContentVariation(item);

  const newValues = variationValue
    ? {
        data: variationValue.data,
        testVariationId: variationValue.id,
        testVariationName:
          variationValue.name ||
          (variationValue.id === item.id ? 'Default' : ''),
      }
    : {
        testVariationId: item.id,
        testVariationName: 'Default',
      };

  Object.assign(item, newValues);
};
