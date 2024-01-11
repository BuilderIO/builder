/**
 * Overriding usage of `node:module` because of https://github.com/vercel/next.js/issues/60491
 * This doesn't actually work in production, but it lets the tests pass...
 * Mono-repo env seems to pull in the SDK differently which allows the eval('require') to work.
 */

const noop = () => {};

export let safeDynamicRequire: typeof require =
  noop as unknown as typeof require;

try {
  safeDynamicRequire = eval('require');
} catch (error) {
  /* empty */
}
