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

export const initializeNodeRuntime = () => {
  setIvm(ivm);
};
