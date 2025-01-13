import {
  flatten,
  flattenMongoQuery,
  unflatten,
} from '../../helpers/flatten.js';
import { normalizeSearchParams } from '../../helpers/search/search.js';
import { DEFAULT_API_VERSION } from '../../types/api-version.js';
import { getBuilderSearchParamsFromWindow } from '../get-builder-search-params/index.js';
import { isBrowser } from '../is-browser.js';
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
    apiHost,
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
  const baseUrl = apiHost || 'https://cdn.builder.io';

  const url = new URL(`${baseUrl}/api/${apiVersion}/content/${model}`);

  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('noTraverse', String(noTraverse));
  url.searchParams.set('includeRefs', String(true));

  const finalLocale = locale || userAttributes?.locale;
  let finalUserAttributes: Record<string, any> = userAttributes || {};

  if (finalLocale) {
    url.searchParams.set('locale', finalLocale);
    finalUserAttributes = {
      locale: finalLocale,
      ...finalUserAttributes,
    };
  }
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
    ...getBuilderSearchParamsFromWindow(),
    ...normalizeSearchParams(options.options || {}),
  };

  finalUserAttributes = {
    ...finalUserAttributes,
    ...getUserAttributesAsJSON(queryOptions),
  };

  const flattened = flatten(queryOptions);
  for (const key in flattened) {
    url.searchParams.set(key, String(flattened[key]));
  }

  if (Object.keys(finalUserAttributes).length > 0) {
    url.searchParams.set('userAttributes', JSON.stringify(finalUserAttributes));
  }
  if (query) {
    const flattened = flattenMongoQuery({ query });
    for (const key in flattened) {
      url.searchParams.set(key, JSON.stringify(flattened[key]));
    }
  }
  return url;
};

const getUserAttributesFromQueryOptions = (queryOptions: any) => {
  const newUserAttributes: any = {};
  for (const key in queryOptions) {
    if (key.startsWith('userAttributes.')) {
      newUserAttributes[key] = queryOptions[key];
      delete queryOptions[key];
    }
  }
  return newUserAttributes;
};

const getUserAttributesAsJSON = (queryOptions: any) => {
  if (isBrowser() && queryOptions['preview'] === 'BUILDER_STUDIO') {
    queryOptions['userAttributes.urlPath'] = window.location.pathname;
    queryOptions['userAttributes.host'] = window.location.host;

    const queryOptionsForUserAttributes =
      getUserAttributesFromQueryOptions(queryOptions);
    const { userAttributes } = unflatten(queryOptionsForUserAttributes);
    return userAttributes;
  }
  return {};
};
