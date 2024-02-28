import type { Search } from '../helpers/search/search.js';
import { getSearchString } from '../helpers/search/search.js';
import { isBrowser } from './is-browser.js';
import { isEditing } from './is-editing.js';

export function isPreviewing(search?: Search) {
  if (!isBrowser()) {
    return false;
  }

  const normalizedSearch = getSearchString(search || window.location.search);

  if (isEditing(normalizedSearch)) {
    return false;
  }

  return Boolean(normalizedSearch.indexOf('builder.preview=') !== -1);
}
