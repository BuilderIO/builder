const seedrandom = require('seedrandom');
const rng = seedrandom('vue-sdk-seed');

const getSeededId = () => {
  const rngVal = rng();
  return Number(String(rngVal).split('.')[1]).toString(36);
};

/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  targets: ['reactNative', 'vue', 'svelte'],
  options: {
    vue: {
      registerComponentPrepend:
        "import { registerComponent } from '../functions/register-component'",
      cssNamespace: getSeededId,
    },
    svelte: {
      // prettier & svelte don't play well together when it comes to parsing @html content for some reason
      // https://github.com/sveltejs/prettier-plugin-svelte/issues/290
      prettier: false,
    },
  },
};
