import { flatten } from '../../helpers/flatten.js';
import { DEFAULT_API_VERSION } from '../../types/api-version.js';
import {
  getBuilderSearchParamsFromWindow,
  normalizeSearchParams,
} from '../get-builder-search-params/index.js';
import type { GetContentOptions } from './types.js';

const isPositiveNumber = (thing: unknown) =>
  typeof thing === 'number' && !isNaN(thing) && thing >= 0;

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
    fields,
    omit,
    offset,
    cacheSeconds,
    staleCacheSeconds,
    sort,
    includeUnpublished,
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

  url.searchParams.set('omit', omit || 'meta.componentsUsed');

  if (fields) {
    url.searchParams.set('fields', fields);
  }

  if (Number.isFinite(offset) && offset! > -1) {
    url.searchParams.set('offset', String(Math.floor(offset!)));
  }

  if (typeof includeUnpublished === 'boolean') {
    url.searchParams.set('includeUnpublished', String(includeUnpublished));
  }

  if (cacheSeconds && isPositiveNumber(cacheSeconds)) {
    url.searchParams.set('cacheSeconds', String(cacheSeconds));
  }

  if (staleCacheSeconds && isPositiveNumber(staleCacheSeconds)) {
    url.searchParams.set('staleCacheSeconds', String(staleCacheSeconds));
  }

  if (sort) {
    const flattened = flatten({ sort });
    for (const key in flattened) {
      url.searchParams.set(key, JSON.stringify((flattened as any)[key]));
    }
  }

  // TODO: how to express 'offset' in the url - as direct queryparam or as flattened in options[key] ?

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
