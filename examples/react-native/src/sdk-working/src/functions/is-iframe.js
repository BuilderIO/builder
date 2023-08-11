import { isBrowser } from "./is-browser.js";
function isIframe() {
  return isBrowser() && window.self !== window.top;
}
export {
  isIframe
};
