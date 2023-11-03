const traverse = require('traverse');
const seedrandom = require('seedrandom');
const rng = seedrandom('vue-sdk-seed');

/**
 * @typedef {import('@builder.io/mitosis')} Mitosis
 * @typedef {import('@builder.io/mitosis').MitosisNode} MitosisNode
 * @typedef {import('@builder.io/mitosis').StateValue} StateValue
 * @typedef {import('@builder.io/mitosis').MitosisConfig} MitosisConfig
 * @typedef {import('@builder.io/mitosis').Plugin} Plugin
 */

/**
 *
 * @param {MitosisNode} node
 */
const filterEmptyTextNodes = (node) =>
  !(
    typeof node.properties._text === 'string' &&
    !node.properties._text.trim().length
  );

const getSeededId = () => {
  const rngVal = rng();
  return Number(String(rngVal).split('.')[1]).toString(36);
};

/**
 * @param {any} x
 * @returns {x is MitosisNode}
 */
const isMitosisNode = (x) => x && x['@type'] === '@builder.io/mitosis/node';

/**
 * @param {string} string
 */
const kebabCase = (string) =>
  string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

/**
 * @type {MitosisConfig['getTargetPath']}
 */
const getTargetPath = ({ target }) => {
  switch (target) {
    // we have to workaround a name collision, where the folder can't have the name of the `exports` property in package.json.
    // crazy, crazy stuff.
    case 'vue2':
      return 'vue/vue2';
    case 'vue':
    case 'vue3':
      return 'vue/vue3';
    case 'rsc':
      return 'nextjs';
    default:
      return kebabCase(target);
  }
};

/**
 * @type {MitosisConfig['options']['vue']}
 */
const vueConfig = {
  typescript: true,
  namePrefix: (path) => (path.includes('/blocks/') ? 'builder' : ''),
  cssNamespace: getSeededId,
  plugins: [
    () => ({
      json: {
        // This plugin handles binding our actions to the `v-on:` Vue syntax:
        // - in our block components, the actions will come through `props.attributes` and need to be filtered
        // - in Block, the actions will be good to go from `state.actions`, and just need the `v-on:` prefix to be removed
        pre: (json) => {
          traverse(json).forEach(function (item) {
            if (!isMitosisNode(item)) return;

            if (json.name === 'BlockWrapper') {
              const key = Object.keys(item.bindings).find((x) =>
                x.startsWith('getBlockActions')
              );
              if (key) {
                const binding = item.bindings[key];
                if (binding) {
                  item.bindings[key] = {
                    ...binding,
                    type: 'spread',
                    spreadType: 'event-handlers',
                  };
                }
              }
            }

            const filterAttrKeys = Object.entries(item.bindings).filter(
              ([_key, value]) =>
                value?.code.includes('filterAttrs') &&
                value.code.includes('true')
            );

            for (const [key, value] of filterAttrKeys) {
              if (value) {
                item.bindings[key] = {
                  ...value,
                  type: 'spread',
                  spreadType: 'event-handlers',
                };
              }
            }
          });
        },
      },
    }),
  ],
  api: 'options',
};

/**
 * @type {Plugin}
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
 * @type {Plugin}
 */
const BASE_TEXT_PLUGIN = () => ({
  code: {
    pre: (code) => {
      if (code.includes('<Text>') && !code.includes('InlinedStyles')) {
        const importStatement = `import BaseText from '../BaseText';`;
        // we put the import statement after the first line so the `use client` comment stays at the top.
        // probably doesn't matter but just in case
        const [firstLine, ...restOfCode] = code.split('\n');
        return `
${firstLine}
${importStatement}
${restOfCode.join('\n').replace(/<(\/?)Text(.*?)>/g, '<$1BaseText$2>')}
`;
      }
      return code;
    },
  },
});

const target = process.argv
  .find((arg) => arg.startsWith('--target='))
  ?.split('=')[1];

const targets = target
  ? [target]
  : ['reactNative', 'vue2', 'rsc', 'vue3', 'solid', 'svelte', 'react', 'qwik'];

/**
 * @type {MitosisConfig}
 */
module.exports = {
  files: 'src/**',
  exclude: ['src/**/*.test.ts'],
  targets,
  getTargetPath,
  options: {
    vue2: {
      ...vueConfig,
      asyncComponentImports: true,
      plugins: [
        ...(vueConfig?.plugins || []),
        () => ({
          json: {
            pre: (json) => {
              // TO-DO: should be able to remove this once vue2 fragment workaround is merged.
              if (json.name === 'Image') {
                json.children[0].name = 'div';
              }

              if (json.name === 'Block') {
                // drop the wrapper `Show`, move its condition to the root `<template>`
                json.children = json.children[0].children;

                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) return;

                  const children = item.children.filter(filterEmptyTextNodes);

                  // add back wrapper `Show`'s condition for Vue 2
                  if (item.name === 'Show' && item.bindings.when) {
                    item.bindings.when.code += '&& state.canShowBlock';
                  }

                  /**
                   * Hack to get around the fact that we can't have a v-for loop inside of a v-else in Vue 2.
                   */
                  if (
                    item.name === 'Show' &&
                    children.length === 1 &&
                    children[0].name === 'For'
                  ) {
                    const forBlock = children[0];

                    /**
                     * @type {MitosisNode}
                     */
                    const divWorkaroundBlock = {
                      '@type': '@builder.io/mitosis/node',
                      name: 'div',
                      meta: {},
                      scope: {},
                      children: [forBlock],
                      bindings: {},
                      properties: {
                        class: 'vue2-root-element-workaround',
                      },
                    };
                    const newItem = {
                      ...item,
                      children: [divWorkaroundBlock],
                    };
                    this.update(newItem);
                    this.stop();
                  }
                });
              }
            },
          },
          code: {
            pre: (code) => {
              if (code.includes("name: 'block'")) {
                // 2 edge cases for the wrapper Show's condition need to be hardcoded for now
                return code
                  .replace(
                    '<block-wrapper v-else ',
                    '<block-wrapper v-else-if="canShowBlock" '
                  )
                  .replace('&& canShowBlock)"', ') && canShowBlock"');
              }
              return code;
            },
          },
        }),
      ],
    },
    vue3: { ...vueConfig, asyncComponentImports: false },
    react: {
      typescript: true,
      plugins: [SRCSET_PLUGIN],
      stylesType: 'style-tag',
    },
    rsc: {
      typescript: true,
      plugins: [
        SRCSET_PLUGIN,
        () => ({
          json: {
            pre: (json) => {
              if (json.name === 'Symbol') {
                delete json.state.setContent;

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                json.state.contentToUse.code =
                  json.state.contentToUse?.code.replace('async () => ', '');
              } else if (json.name === 'EnableEditor') {
                json.imports.push({
                  path: 'next/navigation',
                  imports: {
                    useRouter: 'useRouter',
                  },
                });

                json.hooks.init = {
                  code: `const router = useRouter();`,
                };
              }
              return json;
            },
          },
          code: {
            pre: (code) => {
              return code.replace('function Symbol(', 'async function Symbol(');
            },
          },
        }),
      ],
      stylesType: 'style-tag',
    },
    reactNative: {
      plugins: [
        SRCSET_PLUGIN,
        BASE_TEXT_PLUGIN,
        () => ({
          json: {
            pre: (json) => {
              /**
               * We cannot set context in `ComponentRef` because it's a light Qwik component.
               * We only need to set the context for a React Native need: CSS-style inheritance for Text blocks.
               **/
              if (json.name === 'ComponentRef') {
                json.imports.push({
                  imports: {
                    BuilderContext: 'default',
                  },
                  path: '../../../../context/builder.context.lite',
                });
                json.context.set = {
                  '../../../../context/builder.context.lite:default': {
                    name: 'BuilderContext',
                    value: {
                      content: {
                        code: 'props.context.content',
                        type: 'property',
                      },
                      rootState: {
                        code: 'props.context.rootState',
                        type: 'property',
                      },
                      localState: {
                        code: 'props.context.localState',
                        type: 'property',
                      },
                      context: {
                        code: 'props.context.context',
                        type: 'property',
                      },
                      apiKey: {
                        code: 'props.context.apiKey',
                        type: 'property',
                      },
                      componentInfos: {
                        code: 'props.context.componentInfos',
                        type: 'property',
                      },
                      inheritedStyles: {
                        code: 'props.context.inheritedStyles',
                        type: 'property',
                      },
                      apiVersion: {
                        code: 'props.context.apiVersion',
                        type: 'property',
                      },
                    },
                  },
                };
              }
            },
          },
        }),
        () => ({
          json: {
            pre: (json) => {
              if (!json.meta?.useMetadata?.plugins?.reactNative?.useScrollView)
                return;

              /**
               * We need the ScrollView for the `BlocksWrapper` and `EnableEditor` components to be able to scroll
               * through the whole page.
               */
              traverse(json).forEach(function (item) {
                if (!isMitosisNode(item)) return;

                /**
                 * Not sure when the div->View transformation happens in Mitosis, so we check both to be safe.
                 */
                if (item.name === 'View' || item.name === 'div') {
                  item.name = 'ScrollView';
                }
              });
            },
          },
        }),
      ],
    },
    qwik: {
      typescript: true,
      plugins: [SRCSET_PLUGIN],
    },
    svelte: {
      typescript: true,
      plugins: [
        /**
         * This plugin modifies `svelte:component` to elements to use the `svelte:element` syntax instead.
         * `svelte:component` is used for rendering dynamic Svelte components, and `svelte:element` is used for
         * rendering dynamic HTML elements. Mitosis can't know which one to use, and defaults to `svelte:component`,
         * so we have to override that.
         */
        () => ({
          json: {
            pre: (json) => {
              const tag =
                json.meta.useMetadata && json.meta.useMetadata.elementTag;

              if (tag) {
                const tagArr = Array.isArray(tag) ? tag : [tag];

                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) return;

                  if (tagArr.includes(item.name)) {
                    item.bindings.this = {
                      type: 'single',
                      ...item.bindings.this,
                      code: item.name,
                    };
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
              // This plugin handles binding our actions to the `use:` Svelte syntax:

              // handle case where we have a wrapper element, in which case the actions are assigned in `BlockWrapper`.
              if (json.name === 'BlockWrapper') {
                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) return;

                  const key = Object.keys(item.bindings).find((x) =>
                    x.startsWith('getBlockActions')
                  );
                  if (key) {
                    const binding = item.bindings[key];
                    if (binding) {
                      item.bindings['use:setAttrs'] = {
                        ...binding,
                        type: 'single',
                      };
                      delete item.bindings[key];
                    }
                  }
                });
                return json;
              }

              // handle case where we have no wrapper element, in which case the actions are passed as attributes to our
              // builder blocks.
              traverse(json).forEach(function (item) {
                if (!isMitosisNode(item)) return;

                const filterAttrKeys = Object.entries(item.bindings).filter(
                  ([_key, value]) =>
                    value?.code.includes('filterAttrs') &&
                    value.code.includes('true')
                );

                for (const [key, value] of filterAttrKeys) {
                  if (value) {
                    item.bindings['use:setAttrs'] = {
                      ...value,
                      type: 'single',
                    };

                    delete item.bindings[key];
                  }
                }
              });

              return json;
            },
          },
        }),
      ],
    },
  },
};
