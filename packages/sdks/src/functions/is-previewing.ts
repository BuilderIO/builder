import { isBrowser } from './is-browser';
import { isEditing } from './is-editing';

export function isPreviewing() {
  if (!isBrowser()) {
    return false;
  }

  if (isEditing()) {
    return false;
  }

  return Boolean(location.search.indexOf('builder.preview=') !== -1);
}
