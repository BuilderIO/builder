// import { viteOutputGenerator } from '@builder.io/sdks/output-generation';

module.exports = {
  source: 'src',
  output: 'lib',
  targets: [
    [
      'commonjs',
      {
        copyFlow: true,
      },
    ],
    'module',
    'typescript',
  ],
};
