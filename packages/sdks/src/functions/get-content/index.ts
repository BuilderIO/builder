import { flatten } from '../../helpers/flatten.js';
import { BuilderContent } from '../../types/builder-content.js';
import { getFetch } from '../get-fetch.js';
import { handleABTesting } from './ab-testing.js';

export type GetContentOptions = import('./types.js').GetContentOptions;

const fetch$ = getFetch();

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

interface PaginatedResponse {
  results: BuilderContent[];
}

export async function getAllContent(options: GetContentOptions) {
  const url = generateContentUrl(options);

  const fetch = await fetch$;
  const content: PaginatedResponse = await fetch(url.href).then((res) =>
    res.json()
  );

  if (options.testGroups) {
    for (const item of content.results) {
      handleABTesting(item, options.testGroups);
    }
  }

  return content;
}
