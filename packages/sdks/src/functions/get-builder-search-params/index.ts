import type { QueryObject } from '../../helpers/search/search.js';
import { normalizeSearchParams } from '../../helpers/search/search.js';
import type { GetContentOptions } from '../get-content/types.js';
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
  extraArgs?: { model: string; contentId: string }
) => {
  if (!_options) {
    return {};
  }
  const options = normalizeSearchParams(_options);
  console.log('getBuilderSearchParams extraArgs', extraArgs);
  const newOptions: QueryObject = {};
  Object.keys(options).forEach((key) => {
    if (key === 'builder.preview' && options[key] === 'BUILDER_STUDIO') {
      newOptions['preview'] = extraArgs?.model || '';
      newOptions[`overrides.${newOptions['preview']}`] =
        extraArgs?.contentId || '';
    } else if (key.startsWith(BUILDER_SEARCHPARAMS_PREFIX)) {
      const trimmedKey = key
        .replace(BUILDER_SEARCHPARAMS_PREFIX, '')
        .replace(BUILDER_OPTIONS_PREFIX, '');
      newOptions[trimmedKey] = options[key];
    }
  });
  console.log('newOptions', newOptions);
  return newOptions;
};

export const getBuilderSearchParamsFromWindow = (extraArgs?: {
  model: string;
  contentId: string;
}) => {
  if (!isBrowser()) {
    return {};
  }
  const searchParams = new URLSearchParams(window.location.search);
  return getBuilderSearchParams(searchParams, extraArgs);
};
