/**
 * @typedef {import('@builder.io/mitosis')} Mitosis
 * @typedef {import('@builder.io/mitosis').MitosisNode} MitosisNode
 * @typedef {import('@builder.io/mitosis').StateValue} StateValue
 * @typedef {import('@builder.io/mitosis').MitosisConfig} MitosisConfig
 * @typedef {import('@builder.io/mitosis').Plugin} Plugin
 */

/**
 * @type {MitosisConfig['options']['vue']}
 */
const vueConfig = {
  typescript: true,
  namePrefix: path => (path.includes('/blocks/') ? 'builder' : ''),
  asyncComponentImports: true,
  api: 'options',
};

/**
 * @type {MitosisConfig}
 */
module.exports = {
  files: 'src/**',
  targets: ['reactNative', 'vue2', 'rsc', 'vue3', 'solid', 'svelte', 'react', 'qwik'],
  options: {
    vue2: {
      ...vueConfig,
    },
    vue3: vueConfig,
    react: {
      stylesType: 'style-tag',
      typescript: true,
    },
    reactNative: {
      typescript: true,
    },
    qwik: {
      typescript: true,
    },
    svelte: {
      typescript: true,
    },
  },
};
