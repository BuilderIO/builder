import { flatten, flattenMongoQuery } from '../../helpers/flatten.js';
import { normalizeSearchParams } from '../../helpers/search/search.js';
import { DEFAULT_API_VERSION } from '../../types/api-version.js';
import { getBuilderSearchParamsFromWindow } from '../get-builder-search-params/index.js';
import type { GetContentOptions } from './types.js';

const isPositiveNumber = (thing: unknown) =>
  typeof thing === 'number' && !isNaN(thing) && thing >= 0;

export const generateContentUrl = (options: GetContentOptions): URL => {
  const {
    limit = 30,
    userAttributes,
    query,
    model,
    apiKey,
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

  if (!['v3'].includes(apiVersion)) {
    throw new Error(
      `Invalid apiVersion: expected 'v3', received '${apiVersion}'`
    );
  }

  // if we are fetching an array of content, we disable noTraverse for perf reasons.
  const noTraverse = limit !== 1;

  const url = new URL(
    `https://cdn.builder.io/api/${apiVersion}/content/${model}`
  );

  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('noTraverse', String(noTraverse));
  url.searchParams.set('includeRefs', String(true));

  if (locale) url.searchParams.set('locale', locale);
  if (enrich) url.searchParams.set('enrich', String(enrich));

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
    ...getBuilderSearchParamsFromWindow({
      model: options.model,
    }),
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
    const flattened = flattenMongoQuery({ query });
    for (const key in flattened) {
      url.searchParams.set(key, JSON.stringify(flattened[key]));
    }
  }
  return url;
};
