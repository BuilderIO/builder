'use strict';

import { Builder } from '@builder.io/sdk';

const noop = () => null;
// Allow us to require things dynamically safe from webpack bundling

export let safeDynamicRequire: typeof require;

/*
 * The if condition below used to be if (typeof globalThis.require === "function"
 * That broke in case Builder was running on the server (Next, SSR use-cases) where
 * globalThis.require was undefined. Avoiding use of Builder.isServer for Cloudflare worker cases
 */
if (typeof require === 'function') safeDynamicRequire = eval('require');
safeDynamicRequire ??= noop as any;
