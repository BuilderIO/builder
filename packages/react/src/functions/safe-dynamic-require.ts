'use strict';

import { Builder } from '@builder.io/sdk';

// Allow us to require things dynamically safe from webpack bundling
export const safeDynamicRequire: typeof require = Builder.isServer
  ? eval('require')
  : ((() => null) as any);
