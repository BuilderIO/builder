import type { Search } from '../helpers/search/search.js';
import { getSearchString } from '../helpers/search/search.js';
import { isBrowser } from './is-browser.js';

/**
 * Checks the current URL's search parameters to see if it is attempting to
 * preview Builder Content.
 *
 * When called on the client, it uses `window.location.search`.
 * When called on the server (SSR), it requires a `search` argument.
 *
 * @param _search - The search parameters to check. Can be a URL string (containing the search parameters), `URLSearchParams`, or a key-value object containing the search parameters.
 * @returns `true` if the current page is being previewed, `false` otherwise.
 */
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
