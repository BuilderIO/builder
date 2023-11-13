const noop = () => null;

/**
 * Allow us to require things dynamically safe from webpack bundling.
 * We need this to be able to import `isolated-vm`, which for some reason has weird build issues when imported (even directly)
 * into certain web apps.
 *
 * NOTE: this could should only ever run in `node`, and never in an edge runtime. This is guaranteed
 * by the fact that each SDK has separate bundles for each runtime.
 * However, it might still end up running in the browser.
 */
export let safeDynamicRequire: typeof require =
  noop as unknown as typeof require;

try {
  safeDynamicRequire = eval('require');
} catch (error) {
  /* empty */
}
