const noop = () => {};

/**
 * Allows us to require node-specific code safely within bundlers.
 *
 * https://github.com/laverdet/isolated-vm/issues/423
 *
 * NOTE: this code should only ever run in `node`, and never in an `edge` runtime.
 * This is guaranteed by the fact that each SDK has separate bundles for each runtime.
 * However, it might still end up running in the `browser` if the `node` bundle is loaded in the
 * browser (which happens in many apps' dev mode, and certain other scenarios like Qwik's prod mode).
 * This is why we catch and ignore the error at the very end.
 */
import { createRequire } from 'node:module';

export let safeDynamicRequire: typeof require =
  noop as unknown as typeof require;

try {
  safeDynamicRequire = createRequire(import.meta.url);
} catch (error) {
  try {
    safeDynamicRequire = eval('require');
  } catch (error) {
    /* empty */
  }
}
