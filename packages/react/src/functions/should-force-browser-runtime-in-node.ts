function isNodeRuntime(): boolean {
  return typeof process !== 'undefined' && Boolean(process?.versions?.node);
}

export const shouldForceBrowserRuntimeInNode = () => {
  if (!isNodeRuntime()) return false;

  const isArm64 = process.arch === 'arm64';
  const isNode20 = process.version.startsWith('v20');

  const hasNoNodeSnapshotNodeOption = process.env.NODE_OPTIONS?.includes('--no-node-snapshot');

  if (isArm64 && isNode20 && !hasNoNodeSnapshotNodeOption) {
    console.log(`Skipping usage of \`isolated-vm\` to avoid crashes in Node v20 on an arm64 machine.
    If you would like to use the \`isolated-vm\` package on this machine, please provide the \`NODE_OPTIONS=--no-node-snapshot\` config to your Node process.
    See https://github.com/BuilderIO/builder/blob/main/packages/react/README.md#node-v20--m1-macs-apple-silicon-support for more information.
    `);

    return true;
  }

  return false;
};
