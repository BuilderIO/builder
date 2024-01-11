const import_meta = {};
const noop = () => {};
import { createRequire } from "node:module";
let safeDynamicRequire = noop;
try {
  safeDynamicRequire = createRequire(import_meta.url);
} catch (error) {
  try {
    safeDynamicRequire = eval("require");
  } catch (error2) {}
}
export { safeDynamicRequire }