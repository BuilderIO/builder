import { isBrowser } from "./is-browser.js";

function isEdgeRuntime() {
  const hasNode = () => {
    var _a;

    return typeof process !== "undefined" && ((_a = process == null ? void 0 : process.versions) == null ? void 0 : _a.node);
  };

  return !isBrowser() && !hasNode();
}

export { isEdgeRuntime }