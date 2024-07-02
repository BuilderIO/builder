/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const rootNodeModules = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'node_modules'
);

// We override this config because expo will automatically include every folder in the yarn monorepo,
// which is vastly overkill and slows down the build.
config.watchFolders = [
  // root node_modules
  rootNodeModules,

  // packages/node_modules
  path.join(__dirname, '..', '..', '..', 'node_modules'),

  // packages/sdks-tests
  path.join(__dirname, '..', '..', '..', 'sdks-tests'),

  // packages/sdks
  path.join(__dirname, '..', '..', '..', 'sdks', 'node_modules'),

  // packages/sdks/output/react-native
  path.join(__dirname, '..', '..', 'output', 'react-native'),

  // this project
  path.join(__dirname),
];

const initialBlockList = Array.isArray(config.resolver.blockList)
  ? config.resolver.blockList
  : [config.resolver.blockList];

/**
 * We need to exclude the react, react-native and react-dom versions coming
 * from the rest of the monorepo, so that we only use the versions that are part of this expo app.
 */
const excludedRootPkgs = new RegExp(
  rootNodeModules + '/(react|react-native|react-dom)/'
);

config.resolver.blockList = [...initialBlockList, excludedRootPkgs];

module.exports = config;
