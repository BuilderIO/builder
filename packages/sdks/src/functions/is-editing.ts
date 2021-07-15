import { isIframe } from './is-iframe';

export function isEditing(): boolean {
  return isIframe() && window.location.search.indexOf('builder.frameEditing=') !== -1;
}
