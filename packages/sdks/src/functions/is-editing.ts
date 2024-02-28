import { TARGET } from '../constants/target.js';
import { getSearchString, type Search } from '../helpers/search/search.js';
import { isIframe } from './is-iframe.js';

export function isEditing(search?: Search) {
  return (
    isIframe() &&
    (TARGET === 'reactNative' ||
      getSearchString(search || window.location.search).indexOf(
        'builder.frameEditing='
      ) !== -1)
  );
}
