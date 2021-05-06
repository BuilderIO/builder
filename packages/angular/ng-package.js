const { resolve } = require('path');
const [outputPath] = process.argv.slice(-1);

const config = {
  $schema: './node_modules/ng-packagr/ng-package.schema.json',
  lib: {
    entryFile: 'src/public_api.ts',
  },
  whitelistedNonPeerDependencies: ['.'],
};

if (outputPath && outputPath.startsWith('bazel-out/') !== -1) {
  // This is a work around for Bazel.
  // Bazel needs to tell ng-packager where the output should be ng-packager does not have such
  // command line options. So we hack it a bit by reading it ourselves.
  config.dest = resolve(outputPath);
}

module.exports = config;
