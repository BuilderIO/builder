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
  try {
    /*
      This is a hack to get around webpack bundling the require function, which is not available in the browser
      Needs to be eval'd to avoid webpack bundling it
    */
    safeDynamicRequire = eval('require');
  } catch (e) {
    /* 
      This is a patch for enviornments where eval is not allowed, like Shopify-hydrogen storefront
      Relevant issue : https://github.com/BuilderIO/builder-shopify-hydrogen/issues/12
    */
    if (globalThis?.require) {
      safeDynamicRequire = globalThis.require;
    } else {
      // @ts-ignore
      safeDynamicRequire = noop;
    }
  }
}

safeDynamicRequire ??= noop as any;
