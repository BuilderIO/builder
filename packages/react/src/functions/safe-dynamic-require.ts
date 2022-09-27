'use strict';

import { Builder } from '@builder.io/sdk';

const noop = () => null;
// Allow us to require things dynamically safe from webpack bundling

export let safeDynamicRequire: typeof require;
if (Builder.isServer) safeDynamicRequire = eval('require');
safeDynamicRequire ??= noop as any;
