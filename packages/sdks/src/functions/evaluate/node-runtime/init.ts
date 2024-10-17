import fs from 'fs';
import os from 'os';

const isNode20 = process.version.startsWith('v20');

const whichOS = (): string => {
  const platform = os.platform();

  switch (platform) {
    case 'linux':
      try {
        const data = fs.readFileSync('/etc/os-release', 'utf8');
        const match = data.match(/^NAME="(.+)"$/m);
        return match ? match[1] : 'Linux (unknown distribution)';
      } catch (err) {
        console.warn('Error reading OS information:', err);
        return 'Linux';
      }
    case 'darwin':
      return 'macOS';
    case 'win32':
      return 'Windows';
    default:
      return platform;
  }
};

const osName = whichOS();
if (osName.includes('Ubuntu') && isNode20) {
  console.warn(
    'WARNING: You are running Node 20 on Ubuntu. This combination is known to cause crashes with `isolated-vm`. See https://github.com/BuilderIO/builder/issues/3605 for more information.'
  );
}

import { shouldForceBrowserRuntimeInNode } from '../should-force-browser-runtime-in-node.js';
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
 * - Qwik's `entry.ssr.tsx` file
 */
export const initializeNodeRuntime = (args?: {
  ivmIsolateOptions?: IsolateOptions;
}) => {
  /**
   * skip initialization if we are on an arm64 machine and running node 20
   */
  if (shouldForceBrowserRuntimeInNode({ shouldLogWarning: true })) {
    return;
  }

  const { ivmIsolateOptions } = args || {};
  setIvm(ivm, ivmIsolateOptions);
};
