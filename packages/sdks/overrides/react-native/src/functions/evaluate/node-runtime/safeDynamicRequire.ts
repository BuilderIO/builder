/**
 * Overriding usage of `import.meta` because the metro bundler in Expo 50+ does not like it.
 */

const noop = () => {};

export let safeDynamicRequire: typeof require =
  noop as unknown as typeof require;

try {
  safeDynamicRequire = eval('require');
} catch (error) {
  /* empty */
}
