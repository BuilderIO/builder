export type QueryObject = Record<string, string | string[]>;

export const convertSearchParamsToQueryObject = (
  searchParams: URLSearchParams
): QueryObject => {
  const options: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    options[key] = value;
  });
  return options;
};

export const normalizeSearchParams = (
  searchParams: QueryObject | URLSearchParams
): QueryObject =>
  searchParams instanceof URLSearchParams
    ? convertSearchParamsToQueryObject(searchParams)
    : searchParams;

export type Search = URLSearchParams | string | QueryObject;

export const getSearchString = (search: Search): string => {
  if (typeof search === 'string') {
    return search;
  } else if (search instanceof URLSearchParams) {
    return search.toString();
  }
  return new URLSearchParams(search as any).toString();
};
