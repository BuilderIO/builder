import { isBrowser } from './is-browser';
import { isReactNative } from './is-react-native';

if (!(isBrowser() || isReactNative())) {
  require('node-fetch');
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

// TODO: targeting, a/b tests, limit
export async function getContent(options: GetContentOptions) {
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
          
        }
      }
    }
  }

  return content;
}
