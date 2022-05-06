import { isBrowser } from './is-browser.js';

export function isIframe(): boolean {
  return isBrowser() && window.self !== window.top;
}
