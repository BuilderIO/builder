const traverse = require('traverse');
const seedrandom = require('seedrandom');
const rng = seedrandom('vue-sdk-seed');

const getSeededId = () => {
  const rngVal = rng();
  return Number(String(rngVal).split('.')[1]).toString(36);
};

/**
 * @param {any} x
 * @returns {x is import('@builder.io/mitosis').MitosisNode}
 */
const isMitosisNode = (x) => x && x['@type'] === '@builder.io/mitosis/node';

const kebabCase = (string) =>
  string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

/**
 * @type {import('@builder.io/mitosis'.MitosisConfig['getTargetPath'])}
 */
const getTargetPath = ({ target }) => {
  switch (target) {
    // we have to workaround a name collision, where the folder can't have the name of the `exports` property in package.json.
    // crazy, crazy stuff.
    case 'vue2':
      return 'vue/packages/_vue2';
    case 'vue':
    case 'vue3':
      return 'vue/packages/_vue3';
    default:
      return kebabCase(target);
  }
};

/**
 * @type {import('@builder.io/mitosis'.MitosisConfig['options']['vue'])}
 */
const vueConfig = {
  typescript: true,
  namePrefix: (path) => (path.includes('/blocks/') ? 'builder' : undefined),
  cssNamespace: getSeededId,
  asyncComponentImports: true,
};

/**
 * @type {import('@builder.io/mitosis'.Plugin)}
 */
const SRCSET_PLUGIN = () => ({
  code: {
    pre: (code) => {
      // workaround until we resolve
      // https://github.com/BuilderIO/mitosis/issues/526
      return code.replace(/srcset=/g, 'srcSet=');
    },
  },
});

/**
 * Replaces all uses of the native `Text` component with our own `BaseText` component that injects inherited CSS styles
 * to `Text`, mimicking CSS inheritance.
 * @type {import('@builder.io/mitosis'.Plugin)}
 */
const BASE_TEXT_PLUGIN = () => ({
  code: {
    pre: (code) => {
      if (code.includes('<Text>') && !code.includes('RenderInlinedStyles')) {
        return `
import BaseText from '../BaseText';
${code.replace(/<(\/?)Text(.*?)>/g, '<$1BaseText$2>')}
`;
      }
      return code;
    },
  },
});

/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  targets: ['reactNative', 'vue2', 'vue3', 'solid', 'svelte', 'react', 'qwik'],
  getTargetPath,
  options: {
    vue2: {
      ...vueConfig,
      plugins: [
        () => ({
          json: {
            pre: (json) => {
              if (json.name === 'Image') {
                json.children[0].name = 'div';
              }
            },
          },
        }),
      ],
    },
    vue3: vueConfig,
    react: {
      plugins: [SRCSET_PLUGIN],
      stylesType: 'style-tag',
    },
    reactNative: {
      plugins: [SRCSET_PLUGIN, BASE_TEXT_PLUGIN],
    },
    qwik: {
      typescript: true,
      plugins: [SRCSET_PLUGIN],
    },
    svelte: {
      typescript: true,
      plugins: [
        () => ({
          json: {
            pre: (json) => {
              const tag =
                json.meta.useMetadata && json.meta.useMetadata.elementTag;

              if (tag) {
                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) {
                    return;
                  }

                  if (item.name === tag) {
                    item.bindings.this = { code: item.name };
                    item.name = 'svelte:element';
                  }
                });
              }
            },
          },
        }),
        () => ({
          json: {
            pre: (json) => {
              if (json.name === 'RenderInlinedStyles') {
                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) {
                    return;
                  }

                  if (item.bindings.innerHTML) {
                    item.name = 'Fragment';
                  }
                });
              }
            },
          },
        }),
      ],
    },
  },
};
