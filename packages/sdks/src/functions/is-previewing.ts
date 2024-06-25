import type { Search } from '../helpers/search/search.js';
import { getSearchString } from '../helpers/search/search.js';
import { isBrowser } from './is-browser.js';

export function isPreviewing(_search?: Search) {
  const search = _search || (isBrowser() ? window.location.search : undefined);

  /**
   * If this function is called on the server without an explicit `search` argument,
   * then it can't check if the user is previewing, and will return `false`.
   */
  if (!search) {
    return false;
  }

  const normalizedSearch = getSearchString(search);

  return Boolean(normalizedSearch.indexOf('builder.preview=') !== -1);
}
