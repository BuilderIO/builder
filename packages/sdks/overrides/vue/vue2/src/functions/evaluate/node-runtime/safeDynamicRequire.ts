/**
 * Overriding usage of `node:module` because it breaks for vue2. eval('require') works just as well.
 */

const noop = () => {};

export let safeDynamicRequire: typeof require =
  noop as unknown as typeof require;

try {
  safeDynamicRequire = eval('require');
} catch (error) {
  /* empty */
}
