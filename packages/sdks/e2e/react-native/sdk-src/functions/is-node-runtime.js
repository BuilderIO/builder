import { checkIsDefined } from "../helpers/nullable";
function isNodeRuntime() {
  var _a;
  return typeof process !== "undefined" && checkIsDefined((_a = process == null ? void 0 : process.versions) == null ? void 0 : _a.node);
}
export { isNodeRuntime }