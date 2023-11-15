const noop = () => null;

/**
 * Allows us to require node-specific code safely within bundlers.
 *
 * https://github.com/laverdet/isolated-vm/issues/423
 *
 * NOTE: this code should only ever run in `node`, and never in an `edge` runtime.
 * This is guaranteed by the fact that each SDK has separate bundles for each runtime.
 * However, it might still end up running in the `browser` if the `node` bundle is loaded in the
 * browser (which happens in many apps' dev mode, and certain other scenarios like Qwik's prod mode).
 */
export let safeDynamicRequire: typeof require =
  noop as unknown as typeof require;

try {
  safeDynamicRequire = eval('require');
} catch (error) {
  /* empty */
}
