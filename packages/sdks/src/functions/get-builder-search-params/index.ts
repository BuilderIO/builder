import type { QueryObject } from '../../helpers/search/search.js';
import { normalizeSearchParams } from '../../helpers/search/search.js';
import { isBrowser } from '../is-browser.js';

const BUILDER_SEARCHPARAMS_PREFIX = 'builder.';
const BUILDER_OPTIONS_PREFIX = 'options.';

/**
 * Receives a `URLSearchParams` object or a regular query object, and returns the subset of query params that are
 * relevant to the Builder SDK.
 *
 * @returns
 */
export const getBuilderSearchParams = (
  _options: QueryObject | URLSearchParams | undefined
) => {
  if (!_options) {
    return {};
  }
  const options = normalizeSearchParams(_options);

  const newOptions: QueryObject = {};
  Object.keys(options).forEach((key) => {
    if (key.startsWith(BUILDER_SEARCHPARAMS_PREFIX)) {
      const trimmedKey = key
        .replace(BUILDER_SEARCHPARAMS_PREFIX, '')
        .replace(BUILDER_OPTIONS_PREFIX, '');
      newOptions[trimmedKey] = options[key];
    }
  });
  return newOptions;
};

export const getBuilderSearchParamsFromWindow = () => {
  if (!isBrowser()) {
    return {};
  }
  const searchParams = new URLSearchParams(window.location.search);
  return getBuilderSearchParams(searchParams);
};
