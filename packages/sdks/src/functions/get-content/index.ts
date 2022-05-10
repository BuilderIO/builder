import { BuilderContent } from '../../types/builder-content.js';
import { getFetch } from '../get-fetch.js';

const fetch$ = getFetch();

/**
 * Convert deep object to a flat object with dots
 *
 * { foo: { bar: 'baz' }} -> { 'foo.bar': 'baz' }
 */
function flatten<T extends Record<string, any>>(
  object: T,
  path: string | null = null,
  separator = '.'
): T {
  return Object.keys(object).reduce((acc: T, key: string): T => {
    const value = object[key];
    const newPath = [path, key].filter(Boolean).join(separator);
    const isObject = [
      typeof value === 'object',
      value !== null,
      !(Array.isArray(value) && value.length === 0),
    ].every(Boolean);

    return isObject
      ? { ...acc, ...flatten(value, newPath, separator) }
      : { ...acc, [newPath]: value };
  }, {} as T);
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
  userAttributes?: (Record<string, string> & { urlPath?: string }) | null;
  /** Custom query */
  query?: Record<string, any>;
  /** Other API options as key:value pairs */
  options?: Record<string, any>;
  /**
   * If set to `true`, it will lazy load symbols/references.
   * If set to `false`, it will render the entire content tree eagerly.
   */
  noTraverse?: boolean;
};

export async function getContent(
  options: GetContentOptions
): Promise<BuilderContent | null> {
  return (await getAllContent({ ...options, limit: 1 })).results[0] || null;
}

export const generateContentUrl = (options: GetContentOptions): URL => {
  const {
    limit = 1,
    userAttributes,
    query,
    noTraverse = false,
    model,
    apiKey,
  } = options;

  const url = new URL(
    `https://cdn.builder.io/api/v2/content/${model}?apiKey=${apiKey}&limit=${limit}&noTraverse=${noTraverse}`
  );

  if (options.options) {
    const flattened = flatten(options.options);
    for (const key in flattened) {
      url.searchParams.set(key, String(flattened[key]));
    }
  }

  if (userAttributes) {
    url.searchParams.set('userAttributes', JSON.stringify(userAttributes));
  }
  if (query) {
    const flattened = flatten({ query });
    for (const key in flattened) {
      url.searchParams.set(key, JSON.stringify((flattened as any)[key]));
    }
  }

  return url;
};

const handleABTesting = (
  content: any,
  testGroups: NonNullable<GetContentOptions['testGroups']>
) => {
  for (const item of content.results) {
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
              variation.name ||
              (variation.id === item.id ? 'Default variation' : '');
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
};

export async function getAllContent(options: GetContentOptions) {
  const url = generateContentUrl(options);

  const fetch = await fetch$;
  const content = await fetch(url.href).then((res) => res.json());

  if (options.testGroups) {
    handleABTesting(content, options.testGroups);
  }

  return content;
}
