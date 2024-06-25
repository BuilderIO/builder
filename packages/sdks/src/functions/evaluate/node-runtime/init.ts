/**
 * This file:
 * - imports `isolated-vm`, which can only be made from a file that never runs
 * on the client (e.g. Next's `_document.tsx`)
 * - stores the ivm instance in a global variable using `setIvm`
 *
 * This is needed for when bundlers/meta-frameworks are not able to reliably
 * import the `isolated-vm` package using our `safeDynamicRequire` trick.
 *
 * The `isolated-vm` import must exist in this separate file, or it will end up
 * in the SDK's main entry point, causing errors for users.
 */
import ivm from 'isolated-vm';
import { setIvm } from './node-runtime.js';

import type { IsolateOptions } from 'isolated-vm';

/**
 * This function initializes the SDK on a Node server. It handles importing the
 * `isolated-vm` package which is needed for dynamic bindings.
 *
 * NOTE: this function cannot be called on the client. You must call this function
 * from a server-only location, such as:
 * - The NextJS Pages router's `_document.tsx`
 * - Your Remix route's `loader`
 */
export const initializeNodeRuntime = (args?: {
  ivmIsolateOptions?: IsolateOptions;
}) => {
  const { ivmIsolateOptions } = args || {};
  setIvm(ivm, ivmIsolateOptions);
};
