import { isBrowser } from './is-browser.js';
import { isEditing } from './is-editing.js';

export function isPreviewing() {
  if (!isBrowser()) {
    return false;
  }

  if (isEditing()) {
    return false;
  }

  return Boolean(location.search.indexOf('builder.preview=') !== -1);
}
