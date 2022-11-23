'use strict';

import { Builder } from '@builder.io/sdk';

const noop = () => null;
// Allow us to require things dynamically safe from webpack bundling

export let safeDynamicRequire: typeof require;

/*
 * The if condition below used to be
 *
 *     if (typeof globalThis.require === "function")
 *
 * That broke in case Builder was running on the server (Next, SSR use-cases) where
 * globalThis.require was undefined. Avoiding use of Builder.isServer for Cloudflare worker cases
 * That said, if change it to
 *
 * if (typeof require === 'function') {
 *   localSafeDynamicRequire = eval('require');
 * }
 *
 * Then the TSC / rollup compiler over-optimizes and replaces the if condition with true always
 * causing it to blow up on the client side. Hence this convoluted way of doing it.
 *
 * In Summary:
 *
 * 1. Node -> globalThis.require does not work
 * 2. Cloudflare edge -> only globalThis.require works
 */
if (
  typeof globalThis?.require === 'function' ||
  (Builder.isServer && typeof require === 'function')
) {
  safeDynamicRequire = eval('require');
}

safeDynamicRequire ??= noop as any;
