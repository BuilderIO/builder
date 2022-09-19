import {
  BuilderContent,
  BuilderContentVariation,
} from '../../types/builder-content.js';
import {
  getContentVariationCookie,
  setContentVariationCookie,
} from '../../helpers/ab-tests.js';

/**
 * Randomly assign a variation to this user and store it in cookies/storage
 */
const getRandomVariationId = ({
  id,
  variations,
}: {
  id: string;
  variations: NonNullable<BuilderContent['variations']>;
}) => {
  let n = 0;
  const random = Math.random();

  for (const id in variations) {
    const testRatio = variations[id].testRatio;
    n += testRatio!;

    if (random < n) {
      return id;
    }
  }

  // `item.variations` does not include the default variation
  // if we arrive here, then it means that the random number fits in the default variation bucket
  return id;
};

const getContent = ({
  item,
  testGroupId,
}: {
  item: BuilderContent;
  testGroupId: string | undefined;
}): BuilderContentVariation | undefined => {
  if (!testGroupId) {
    return undefined;
  } else if (testGroupId === item.id) {
    return item;
  } else {
    return item.variations?.[testGroupId];
  }
};

const getContentVariation = async ({ item }: { item: BuilderContent }) => {
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

  const variationValue = getContent({ item, testGroupId });

  if (variationValue) {
    return variationValue;
  } else {
    const randomVariationId = getRandomVariationId({
      variations: item.variations,
      id: item.id,
    });

    await setContentVariationCookie({
      contentId: item.id,
      value: randomVariationId,
      canTrack: true,
    });

    const randomVariationValue = randomVariationId
      ? item.variations[randomVariationId]
      : undefined;

    return randomVariationValue;
  }
};

export const handleABTesting = async ({ item }: { item: BuilderContent }) => {
  const variationValue = await getContentVariation({ item });

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
