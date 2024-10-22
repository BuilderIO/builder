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
  _options: QueryObject | URLSearchParams | undefined,
  extraArgs?: { model: string }
) => {
  if (!_options) {
    return {};
  }
  const options = normalizeSearchParams(_options);
  const newOptions: QueryObject = {};
  Object.keys(options).forEach((key) => {
    if (key.startsWith(BUILDER_SEARCHPARAMS_PREFIX)) {
      if (key === 'builder.preview' && options[key] === 'BUILDER_STUDIO') {
        newOptions['preview'] = extraArgs?.model || '';
      } else if (key === 'builder.userAttributes.date') {
        const date = new Date(options[key] as string);
        newOptions['query.startDate.$lte'] = `${date.getTime()}`;
        newOptions['query.endDate.$gte'] = `${date.getTime()}`;
      } else {
        const trimmedKey = key
          .replace(BUILDER_SEARCHPARAMS_PREFIX, '')
          .replace(BUILDER_OPTIONS_PREFIX, '');
        newOptions[trimmedKey] = options[key];
      }
    }
  });
  return newOptions;
};

export const getBuilderSearchParamsFromWindow = (extraArgs?: {
  model: string;
}) => {
  if (!isBrowser()) {
    return {};
  }
  const searchParams = new URLSearchParams(window.location.search);
  return getBuilderSearchParams(searchParams, extraArgs);
};
