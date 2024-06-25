// eslint-disable-next-line @typescript-eslint/no-var-requires
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * we need to manually exclude dists and nx caches because metro scans them and
 * the `package.json` within will collide with those of the real packages.
 * ref: https://metrobundler.dev/docs/configuration/#blocklist
 */
module.exports = {
  resolver: {
    blacklistRE: exclusionList([
      /.*\/react\/dist\/.*/,
      /.*\/core\/dist\/.*/,
      /.*\/webcomponents\/dist\/.*/,
      /.*\.nx-cache.*/,
    ]),
  },
};
