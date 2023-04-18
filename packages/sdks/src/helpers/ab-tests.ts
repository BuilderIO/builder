import type { CanTrack } from '../types/can-track.js';
import { getCookie, setCookie } from './cookie.js';
import type {
  BuilderContent,
  BuilderContentVariation,
} from '../types/builder-content.js';
import type { Overwrite } from '../types/typescript.js';
import { checkIsDefined } from '../helpers/nullable.js';

const BUILDER_STORE_PREFIX = 'builderio.variations';

const getContentTestKey = (id: string) => `${BUILDER_STORE_PREFIX}.${id}`;

const getContentVariationCookie = ({
  contentId,
  canTrack,
}: { contentId: string } & CanTrack) =>
  getCookie({ name: getContentTestKey(contentId), canTrack });

const setContentVariationCookie = ({
  contentId,
  canTrack,
  value,
}: {
  contentId: string;
  value: string;
} & CanTrack) =>
  setCookie({ name: getContentTestKey(contentId), value, canTrack });

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
 * Randomly assign a variation to a user
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

  // the variations array does not include the default variation.
  // if we arrive here, then it means that the random number fits in the default variation bucket.
  return id;
};

const getAndSetVariantId = ({
  canTrack,
  ...args
}: BuilderContentWithVariations & CanTrack) => {
  // if variation not found in storage, assign a random variation to this user
  const randomVariationId = getRandomVariationId(args);

  // store variation in cookies/storage
  setContentVariationCookie({
    contentId: args.id,
    value: randomVariationId,
    canTrack,
  }).catch((err) => {
    console.error('could not store A/B test variation: ', err);
  });

  return randomVariationId;
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
  // if not found, assign a random variation to this user and store it in cookies/storage
  const testGroupId =
    (await getContentVariationCookie({
      canTrack,
      contentId: item.id,
    })) ||
    getAndSetVariantId({
      variations: item.variations,
      id: item.id,
      canTrack,
    });

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

// TO-DO: make this synchronous
// need to revert react-native hack of making this function async...
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
