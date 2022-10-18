import { flatten } from '../../helpers/flatten.js';
import type { BuilderContent } from '../../types/builder-content.js';
import {
  getBuilderSearchParamsFromWindow,
  normalizeSearchParams,
} from '../get-builder-search-params/index.js';
import { getFetch } from '../get-fetch.js';
import { handleABTesting } from './ab-testing.js';

export type GetContentOptions = import('./types.js').GetContentOptions;

export async function getContent(
  options: GetContentOptions
): Promise<BuilderContent | null> {
  return (await getAllContent({ ...options, limit: 1 })).results[0] || null;
}

export const generateContentUrl = (options: GetContentOptions): URL => {
  const {
    limit = 30,
    userAttributes,
    query,
    noTraverse = false,
    model,
    apiKey,
    includeRefs = true,
  } = options;

  if (!apiKey) {
    throw new Error('Missing API key');
  }

  const url = new URL(
    `https://cdn.builder.io/api/v2/content/${model}?apiKey=${apiKey}&limit=${limit}&noTraverse=${noTraverse}&includeRefs=${includeRefs}`
  );

  const queryOptions = {
    ...getBuilderSearchParamsFromWindow(),
    ...normalizeSearchParams(options.options || {}),
  };

  const flattened = flatten(queryOptions);
  for (const key in flattened) {
    url.searchParams.set(key, String(flattened[key]));
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

interface ContentResponse {
  results: BuilderContent[];
}

export async function getAllContent(
  options: GetContentOptions
): Promise<ContentResponse> {
  const url = generateContentUrl(options);

  const fetch = await getFetch();
  const content: ContentResponse = await fetch(url.href).then((res) =>
    res.json()
  );

  const canTrack = options.canTrack !== false;
  if (canTrack) {
    for (const item of content.results) {
      await handleABTesting({ item, canTrack });
    }
  }

  return content;
}
