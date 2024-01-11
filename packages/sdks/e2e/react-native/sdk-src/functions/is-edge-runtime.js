import { isBrowser } from "./is-browser.js";
import { isNodeRuntime } from "./is-node-runtime.js";
function isEdgeRuntime() {
  return !isBrowser() && !isNodeRuntime();
}
export { isEdgeRuntime }