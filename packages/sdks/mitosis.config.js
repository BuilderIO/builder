const traverse = require('traverse');
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
      plugins: [
        () => ({
          json: {
            pre: (json) => {
              const tag =
                json.meta.useMetadata && json.meta.useMetadata.elementTag;

              const isMitosisNode = (x) =>
                x && x['@type'] === '@builder.io/mitosis/node';

              if (tag) {
                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) {
                    return;
                  }

                  if (item.name === tag) {
                    item.bindings.this = item.name;
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
                  // use <svelte:self>'
                  // no longer necessary once PR is merged
                  .replace(
                    // eslint-disable-next-line no-regex-spaces
                    /<RenderBlock  block=\{child\} ><\/RenderBlock>/g,
                    '<svelte:self block={child}></svelte:self>'
                  )
                  // temporary workaround for <style> causing vite-plugin-svelte to break
                  // TBD issue
                  .replace(
                    '`<style>${injectedStyles()}</style>`',
                    '`<styles>${injectedStyles()}</styles>`'
                  )
                  // temporary workaround until https://github.com/BuilderIO/mitosis/issues/282 is fixed
                  .replace('class="img"', '')
                  .replace('class="div"', '')
              );
            },
          },
        }),
      ],
    },
  },
};
