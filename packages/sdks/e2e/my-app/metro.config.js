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

// console.log('config: ', config);

module.exports = config;
