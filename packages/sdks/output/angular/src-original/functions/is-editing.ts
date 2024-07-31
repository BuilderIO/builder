import { TARGET } from '../constants/target';
import { getSearchString, type Search } from '../helpers/search/search';
import { isIframe } from './is-iframe';
export function isEditing(search?: Search) {
  return isIframe() && (TARGET === 'reactNative' ||
  // accessing window.location.search is safe here because `isIframe()` is only `true` if we're in a browser.
  getSearchString(search || window.location.search).indexOf('builder.frameEditing=') !== -1);
}