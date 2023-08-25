import { TARGET } from '../constants/target';
import { isIframe } from './is-iframe';
export function isEditing(): boolean {
  return (
    isIframe() &&
    (TARGET === 'reactNative' ||
      window.location.search.indexOf('builder.frameEditing=') !== -1)
  );
}
