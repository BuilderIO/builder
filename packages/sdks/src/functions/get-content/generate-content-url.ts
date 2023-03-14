import { flatten } from '../../helpers/flatten.js';
import {
  getBuilderSearchParamsFromWindow,
  normalizeSearchParams,
} from '../get-builder-search-params/index.js';
import type { GetContentOptions } from './types.js';

export const generateContentUrl = (options: GetContentOptions): URL => {
  const {
    limit = 30,
    userAttributes,
    query,
    noTraverse = false,
    model,
    apiKey,
    includeRefs = true,
    locale,
    apiVersion = 'v2',
  } = options;

  if (!apiKey) {
    throw new Error('Missing API key');
  }

  if (!['v2', 'v3'].includes(apiVersion)) {
    throw new Error(
      `Invalid apiVersion: expected 'v2' or 'v3', received '${apiVersion}'`
    );
  }

  const url = new URL(
    `https://cdn.builder.io/api/${apiVersion}/content/${model}?apiKey=${apiKey}&limit=${limit}&noTraverse=${noTraverse}&includeRefs=${includeRefs}${
      locale ? `&locale=${locale}` : ''
    }`
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
