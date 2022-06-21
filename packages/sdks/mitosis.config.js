const traverse = require('traverse');
const seedrandom = require('seedrandom');
const rng = seedrandom('vue-sdk-seed');

const getSeededId = () => {
  const rngVal = rng();
  return Number(String(rngVal).split('.')[1]).toString(36);
};

const isMitosisNode = (x) => x && x['@type'] === '@builder.io/mitosis/node';

/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  targets: ['reactNative', 'vue', 'solid', 'svelte'],
  options: {
    solid: {
      transpiler: { format: 'esm' },
    },
    reactNative: {
      transpiler: { format: 'esm' },
    },
    vue: {
      namePrefix: (path) => (path.includes('/blocks/') ? 'builder' : undefined),
      cssNamespace: getSeededId,
      transpiler: { format: 'esm' },
      vueVersion: {
        2: true,
        3: true,
      },
    },
    svelte: {
      transpiler: { format: 'esm' },
      // prettier & svelte don't play well together when it comes to parsing @html content for some reason
      // https://github.com/sveltejs/prettier-plugin-svelte/issues/290
      prettier: false,
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
          code: {
            post: (content) => {
              return (
                content
                  // temporary workaround until https://github.com/BuilderIO/mitosis/issues/282 is fixed
                  .replace('class="img"', '')
                  .replace('class="div"', '')
              );
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
