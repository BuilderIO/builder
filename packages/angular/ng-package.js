const config = {
  $schema: './node_modules/ng-packagr/ng-package.schema.json',
  lib: {
    entryFile: 'src/public_api.ts',
  },
  allowedNonPeerDependencies: ['.'],
};

module.exports = config;
