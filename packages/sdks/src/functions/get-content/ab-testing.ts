import type {
  BuilderContent,
  BuilderContentVariation,
} from '../../types/builder-content.js';
import {
  getContentVariationCookie,
  setContentVariationCookie,
} from '../../helpers/ab-tests.js';
import type { Overwrite } from '../../types/typescript.js';
import type { CanTrack } from '../../types/can-track.js';
import { checkIsDefined } from '../../helpers/nullable.js';

type BuilderContentWithVariations = Overwrite<
  BuilderContent,
  Required<Pick<BuilderContent, 'variations' | 'id'>>
>;

const checkIsBuilderContentWithVariations = (
  item: BuilderContent
): item is BuilderContentWithVariations =>
  checkIsDefined(item.id) &&
  checkIsDefined(item.variations) &&
  Object.keys(item.variations).length > 0;

/**
 * Randomly assign a variation to this user and store it in cookies/storage
 */
const getRandomVariationId = ({
  id,
  variations,
}: BuilderContentWithVariations) => {
  let n = 0;
  const random = Math.random();

  // loop over variations test ratios, incrementing a counter,
  // until we find the variation that this user should be assigned to
  for (const id in variations) {
    const testRatio = variations[id]?.testRatio;
    n += testRatio!;

    if (random < n) {
      return id;
    }
  }

  // `item.variations` does not include the default variation
  // if we arrive here, then it means that the random number fits in the default variation bucket
  return id;
};

const getTestFields = ({
  item,
  testGroupId,
}: {
  item: BuilderContentWithVariations;
  testGroupId: string;
}): TestFields => {
  const variationValue = item.variations[testGroupId];
  if (
    testGroupId === item.id ||
    // handle edge-case where `testGroupId` points to non-existing variation
    !variationValue
  ) {
    return {
      testVariationId: item.id,
      testVariationName: 'Default',
    };
  } else {
    return {
      data: variationValue.data,
      testVariationId: variationValue.id,
      testVariationName:
        variationValue.name || (variationValue.id === item.id ? 'Default' : ''),
    };
  }
};

type TestFields = {
  data?: BuilderContentVariation['data'];
  testVariationId?: string;
  testVariationName: string;
};

const getContentVariation = async ({
  item,
  canTrack,
}: {
  item: BuilderContentWithVariations;
} & CanTrack): Promise<TestFields> => {
  // try to find test variation in cookies/storage
  const testGroupId = await getContentVariationCookie({
    canTrack,
    contentId: item.id,
  });

  const testFields = testGroupId
    ? getTestFields({ item, testGroupId })
    : undefined;

  if (testFields) {
    return testFields;
  } else {
    // if variation not found in storage, assign a random variation to this user
    const randomVariationId = getRandomVariationId({
      variations: item.variations,
      id: item.id,
    });

    // store variation in cookies/storage
    setContentVariationCookie({
      contentId: item.id,
      value: randomVariationId,
      canTrack,
    }).catch((err) => {
      console.error('could not store A/B test variation: ', err);
    });

    return getTestFields({ item, testGroupId: randomVariationId });
  }
};

export const handleABTesting = async ({
  item,
  canTrack,
}: { item: BuilderContent } & CanTrack) => {
  if (!checkIsBuilderContentWithVariations(item)) {
    return;
  }

  const variationValue = await getContentVariation({ item, canTrack });
  Object.assign(item, variationValue);
};
