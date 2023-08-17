const {
  getSdkOutputPath,
} = require('@builder.io/sdks/output-generation/index.js');

module.exports = {
  source: 'src',
  output: getSdkOutputPath(),
  targets: [
    [
      'commonjs',
      {
        copyFlow: true,
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
