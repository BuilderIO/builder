/**
 * Overriding usage of `node:module` because of https://github.com/vercel/next.js/issues/60491
 */

const noop = () => {};

export let safeDynamicRequire: typeof require =
  noop as unknown as typeof require;

try {
  safeDynamicRequire = eval('require');
} catch (error) {
  /* empty */
}
