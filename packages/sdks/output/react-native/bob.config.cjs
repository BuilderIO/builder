const { getSdkOutputPath } = require('../../output-generation/index.js');

module.exports = {
  source: 'src',
  output: getSdkOutputPath(),
  targets: [
    [
      'commonjs',
      {
        configFile: true,
      },
    ],
    [
      'module',
      {
        configFile: true,
      },
    ],
    'typescript',
  ],
};
