import { flatten } from '../../helpers/flatten.js';
import {
  getBuilderSearchParamsFromWindow,
  normalizeSearchParams,
} from '../get-builder-search-params/index.js';
import type { GetContentOptions } from './types.js';
import { DEFAULT_API_VERSION } from '../../types/api-version.js';

export const generateContentUrl = (options: GetContentOptions): URL => {
  let { noTraverse = false } = options;

  const {
    limit = 30,
    userAttributes,
    query,
    model,
    apiKey,
    includeRefs = true,
    enrich,
    locale,
    apiVersion = DEFAULT_API_VERSION,
  } = options;

  if (!apiKey) {
    throw new Error('Missing API key');
  }

  if (!['v2', 'v3'].includes(apiVersion)) {
    throw new Error(
      `Invalid apiVersion: expected 'v2' or 'v3', received '${apiVersion}'`
    );
  }

  // Set noTraverse=true if NOT already passed by user, for query performance
  if (
    (options.limit === undefined || options.limit > 1) &&
    !('noTraverse' in options)
  ) {
    noTraverse = true;
  }

  const url = new URL(
    `https://cdn.builder.io/api/${apiVersion}/content/${model}?apiKey=${apiKey}&limit=${limit}&noTraverse=${noTraverse}&includeRefs=${includeRefs}${
      locale ? `&locale=${locale}` : ''
    }${enrich ? `&enrich=${enrich}` : ''}`
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
