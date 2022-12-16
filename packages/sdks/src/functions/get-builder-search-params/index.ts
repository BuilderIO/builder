import { isBrowser } from '../is-browser.js';

const BUILDER_SEARCHPARAMS_PREFIX = 'builder.';
const BUILDER_OPTIONS_PREFIX = 'options.';
type QueryObject = Record<string, string | string[]>;

export const convertSearchParamsToQueryObject = (
  searchParams: URLSearchParams
): QueryObject => {
  const options: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    options[key] = value;
  });
  return options;
};

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

export const normalizeSearchParams = (
  searchParams: QueryObject | URLSearchParams
): QueryObject =>
  searchParams instanceof URLSearchParams
    ? convertSearchParamsToQueryObject(searchParams)
    : searchParams;
