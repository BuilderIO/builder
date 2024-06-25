// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.watchFolders = [
  '/Users/samijaber/code/work/builder/node_modules',
  '/Users/samijaber/code/work/builder/packages/node_modules',
  '/Users/samijaber/code/work/builder/packages/sdks-tests',
  '/Users/samijaber/code/work/builder/packages/sdks',
  '/Users/samijaber/code/work/builder/packages/react',
  '/Users/samijaber/code/work/builder/packages/sdks/e2e/my-app',
  '/Users/samijaber/code/work/builder/packages/sdks/output/react-native',
];

const initialBlockList = Array.isArray(config.resolver.blockList)
  ? config.resolver.blockList
  : [config.resolver.blockList];

config.resolver.blockList = [
  ...initialBlockList,
  // we need to exclude the react, react-native and react-dom versions coming from the rest of the monorepo,
  // so that we only use the versions that are part of this expo app.
  /Users\/samijaber\/code\/work\/builder\/node_modules\/(react|react-native|react-dom)\//,
];

module.exports = config;
