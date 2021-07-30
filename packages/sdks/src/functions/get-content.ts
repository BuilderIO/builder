import { isBrowser } from './is-browser';
import { isReactNative } from './is-react-native';

if (!(isBrowser() || isReactNative())) {
  import('node-fetch');
}

export type GetContentOptions = {
  /** The model to get content for */
  model: string;
  /** Your public API key */
  apiKey: string;
  /** A/B test groups the current visitor is in. Key is the content ID, value is the variation ID */
  testGroups?: Record<string, string> | null;
  /** Number of items to fetch. Default is 1 */
  limit?: number;
  /** User attributes to target on, such as { urlPath: '/foo', device: 'mobile', ...etc } */
  userAttributes?: Record<string, string> | null;
};

export async function getContent(options: GetContentOptions): Promise<string> {
  return (await getAllContent({ ...options, limit: 1 })).results[0] || null;
}

export async function getAllContent(options: GetContentOptions) {
  const { model, apiKey } = options;

  const { limit, testGroups, userAttributes } = {
    limit: 1,
    userAttributes: null,
    testGroups: null,
    ...options,
  };

  const content = await fetch(
    `https://cdn.builder.io/api/v2/content/${model}?apiKey=${apiKey}&limit=${limit}&userAttributes=${JSON.stringify(
      userAttributes
    )}`
  ).then(res => res.json());

  if (testGroups) {
    for (const item of content) {
      if (item.variations && Object.keys(item.variations).length) {
        const testGroup = testGroups[item.id];
        const variationValue = item.variations[testGroup];
        if (testGroup && variationValue) {
          item.data = variationValue.data;
          item.testVariationId = variationValue.id;
          item.testVariationName = variationValue.name;
        } else {
          // TODO: a/b test iteration logic
          let n = 0;
          const random = Math.random();
          let set = false;
          for (const id in item.variations) {
            const variation = item.variations[id]!;
            const testRatio = variation.testRatio;
            n += testRatio!;
            if (random < n) {
              const variationName =
                variation.name || (variation.id === item.id ? 'Default variation' : '');
              set = true;
              Object.assign(item, {
                data: variation.data,
                testVariationId: variation.id,
                testVariationName: variationName,
              });
            }
          }
          if (!set) {
            Object.assign(item, {
              testVariationId: item.id,
              testVariationName: 'Default',
            });
          }
        }
      }
    }
  }

  return content;
}
