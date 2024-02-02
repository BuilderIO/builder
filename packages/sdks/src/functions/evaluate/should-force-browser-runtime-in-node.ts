import { logger } from '../../helpers/logger.js';
import { isNodeRuntime } from '../is-node-runtime.js';

export const shouldForceBrowserRuntimeInNode = () => {
  if (!isNodeRuntime()) return false;

  const isArm64 = process.arch === 'arm64';
  const isNode20 = process.version.startsWith('v20');

  // if the user passed this node option, then the `isolated-vm` package will work
  const hasNoNodeSnapshotNodeOption =
    process.env.NODE_OPTIONS?.includes('--no-node-snapshot');

  /**
   * https://github.com/laverdet/isolated-vm/issues/424
   */
  if (isArm64 && isNode20 && !hasNoNodeSnapshotNodeOption) {
    logger.log(`Skipping usage of \`isolated-vm\` to avoid crashes in Node v20 on an arm64 machine.
    If you would like to use the \`isolated-vm\` package on this machine, please provide the \`NODE_OPTIONS=--no-node-snapshot\` config to your Node process.
    See https://github.com/laverdet/isolated-vm/issues/424#issuecomment-1864629126 for more information.
    `);

    return true;
  }

  return false;
};