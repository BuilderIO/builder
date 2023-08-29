const {
  getEvaluatorPathAlias,
} = require('@builder.io/sdks/output-generation/index.js');

/**
 * @type {import('@babel/core').ConfigFunction}
 */
module.exports = (api) => {
  api.cache(false);

  const modules = process.env.BOB_BUILDER_MODULES;

  return {
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: ['./src/'],
          alias: getEvaluatorPathAlias({ format: 'js', pointTo: 'full-input' }),
        },
      ],
    ],
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: {
            browsers: [
              '>1%',
              'last 2 chrome versions',
              'last 2 edge versions',
              'last 2 firefox versions',
              'last 2 safari versions',
              'not dead',
              'not ie <= 11',
              'not op_mini all',
              'not android <= 4.4',
              'not samsung <= 4',
            ],
            node: '12',
          },
          useBuiltIns: false,
          modules: modules === 'false' ? false : modules,
        },
      ],
      require.resolve('@babel/preset-react'),
      require.resolve('@babel/preset-typescript'),
      require.resolve('@babel/preset-flow'),
    ],
  };
};
