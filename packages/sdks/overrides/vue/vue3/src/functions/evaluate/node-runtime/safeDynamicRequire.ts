import { createRequire } from 'node:module';

const noop = () => null;

export let safeDynamicRequire: typeof require =
  noop as unknown as typeof require;
try {
  safeDynamicRequire = createRequire(import.meta.url);
} catch (error) {
  /* empty */
}
