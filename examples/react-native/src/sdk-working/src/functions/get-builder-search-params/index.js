import { isBrowser } from "../is-browser.js";
const BUILDER_SEARCHPARAMS_PREFIX = "builder.";
const BUILDER_OPTIONS_PREFIX = "options.";
const convertSearchParamsToQueryObject = (searchParams) => {
  const options = {};
  searchParams.forEach((value, key) => {
    options[key] = value;
  });
  return options;
};
const getBuilderSearchParams = (_options) => {
  if (!_options) {
    return {};
  }
  const options = normalizeSearchParams(_options);
  const newOptions = {};
  Object.keys(options).forEach((key) => {
    if (key.startsWith(BUILDER_SEARCHPARAMS_PREFIX)) {
      const trimmedKey = key.replace(BUILDER_SEARCHPARAMS_PREFIX, "").replace(BUILDER_OPTIONS_PREFIX, "");
      newOptions[trimmedKey] = options[key];
    }
  });
  return newOptions;
};
const getBuilderSearchParamsFromWindow = () => {
  if (!isBrowser()) {
    return {};
  }
  const searchParams = new URLSearchParams(window.location.search);
  return getBuilderSearchParams(searchParams);
};
const normalizeSearchParams = (searchParams) => searchParams instanceof URLSearchParams ? convertSearchParamsToQueryObject(searchParams) : searchParams;
export {
  convertSearchParamsToQueryObject,
  getBuilderSearchParams,
  getBuilderSearchParamsFromWindow,
  normalizeSearchParams
};
