const BUILDER_SEARCHPARAMS_PREFIX = 'builder.';

export const convertSearchParamsToQueryObject = (
  searchParams: URLSearchParams
) => {
  const options: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    options[key] = value;
  });
  return options;
};

export const getBuilderSearchParams = (options: Record<string, string>) => {
  const newOptions: Record<string, string> = {};
  Object.keys(options).forEach((key) => {
    if (key.startsWith(BUILDER_SEARCHPARAMS_PREFIX)) {
      const trimmedKey = key.replace(BUILDER_SEARCHPARAMS_PREFIX, '');
      newOptions[trimmedKey] = options[key];
    }
  });
  return newOptions;
};
