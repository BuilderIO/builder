import { isBrowser } from './is-browser';
export function isIframe(): boolean {
  return isBrowser() && window.self !== window.top;
}
