import { BuilderContent } from '../../types/builder-content.js';

const getStoredTestGroupId = (_id: string): string | undefined => {
  // TO-DO: get from local storage/cookie
  return undefined;
};

const getRandomTestGroupId = (
  variations: NonNullable<BuilderContent['variations']>
) => {
  let n = 0;
  const random = Math.random();
  for (const id in variations) {
    const variation = variations[id];
    const testRatio = variation.testRatio;

    n += testRatio!;

    if (random < n) {
      return id;
    }
  }

  return undefined;
};

const getContentVariation = (item: BuilderContent) => {
  if (
    !item.id ||
    !item.variations ||
    Object.keys(item.variations).length === 0
  ) {
    return;
  }

  // try to find test variation in cookies/storage
  const testGroupId = getStoredTestGroupId(item.id);
  const variationValue = testGroupId ? item.variations[testGroupId] : undefined;

  if (variationValue) {
    return variationValue;
  } else {
    // generate a random ID for this user and store it in cookies/storage
    const randomTestGroupId = getRandomTestGroupId(item.variations);
    const randomVariationValue = randomTestGroupId
      ? item.variations[randomTestGroupId]
      : undefined;

    return randomVariationValue;
  }
};

export const handleABTesting = (item: BuilderContent) => {
  const variationValue = getContentVariation(item);

  const newValues = variationValue
    ? {
        data: variationValue.data,
        testVariationId: variationValue.id,
        testVariationName:
          variationValue.name ||
          (variationValue.id === item.id ? 'Default variation' : ''),
      }
    : {
        testVariationId: item.id,
        testVariationName: 'Default',
      };

  Object.assign(item, newValues);
};
