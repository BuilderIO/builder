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
      return 'vue/packages/_vue2';
    case 'vue':
    case 'vue3':
      return 'vue/packages/_vue3';
    case 'rsc':
      return 'react/packages/rsc';
    case 'react':
      return 'react/packages/react';
    default:
      return kebabCase(target);
  }
};

/**
 * @param {{value: StateValue | undefined, key: string}} args
 */
const convertPropertyStateValueToGetter = (args) => {
  const { value, key } = args;
  if (!value) return;
  value.code = `get ${key}() {\n return ${value.code} \n}`;
  value.type = 'getter';
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
              ([key, value]) =>
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
 * @type {Plugin}
 */
const REACT_NEXT_V13_PLUGIN = () => ({
  code: {
    post: (code) => {
      // Needed for next v13 to work
      return `'use client';\n${code}`;
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
 * @type {MitosisConfig}
 */
module.exports = {
  files: 'src/**',
  targets: [
    'reactNative',
    'vue2',
    'rsc',
    'vue3',
    'solid',
    'svelte',
    'react',
    'qwik',
  ],
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
                    '<component v-else ',
                    '<component v-else-if="canShowBlock" '
                  )
                  .replace(
                    'v-if="!Boolean(!component?.noWrap && canShowBlock)"',
                    'v-if="!Boolean(!component?.noWrap) && canShowBlock"'
                  );
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
      plugins: [
        SRCSET_PLUGIN,
        REACT_NEXT_V13_PLUGIN,
        () => ({
          json: {
            pre: (json) => {
              traverse(json).forEach(function (item) {
                if (!isMitosisNode(item)) return;

                if (item.bindings['dataSet']) {
                  delete item.bindings['dataSet'];
                }

                if (item.properties['dataSet']) {
                  delete item.properties['dataSet'];
                }
              });
            },
          },
        }),
      ],
      stylesType: 'style-tag',
    },
    rsc: {
      plugins: [SRCSET_PLUGIN, REACT_NEXT_V13_PLUGIN],
    },
    reactNative: {
      plugins: [
        SRCSET_PLUGIN,
        REACT_NEXT_V13_PLUGIN,
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
              if (!['BlocksWrapper', 'EnableEditor'].includes(json.name))
                return;

              /**
               * We need the ScrollView for the `BlocksWrapper` and `EnableEditor` components to be able to scroll
               * through the whole page.
               */
              traverse(json).forEach(function (item) {
                if (!isMitosisNode(item)) return;

                if (item.name === 'View') {
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
      plugins: [
        SRCSET_PLUGIN,
        () => ({
          json: {
            pre: (json) => {
              // We want to keep this component as a light component to avoid the overhead of a full component, which is
              // a ton of HTML comments. Therefore, we convert these properties to getters so we don't have `useStore`
              // calls in the component.
              if (json.name === 'Block') {
                convertPropertyStateValueToGetter({
                  value: json.state['repeatItemData'],
                  key: 'repeatItemData',
                });

                convertPropertyStateValueToGetter({
                  value: json.state['component'],
                  key: 'component',
                });
              }

              return json;
            },
          },
        }),
      ],
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
              /**
               * This function's code is stringified and injected in the `Block` component.
               * It therefore cannot import anything outside of its scope.
               *
               * Workaround to dynamically provide event handlers to components/elements.
               * https://svelte.dev/repl/1246699e266f41218a8eeb45b9b58b54?version=3.24.1
               */
              function setAttrs(node, attrs = {}) {
                const attrKeys = Object.keys(attrs);

                const setup = (attr) =>
                  node.addEventListener(attr.substr(3), attrs[attr]);
                const teardown = (attr) =>
                  node.removeEventListener(attr.substr(3), attrs[attr]);

                attrKeys.map(setup);

                return {
                  update(attrs = {}) {
                    const attrKeys = Object.keys(attrs);
                    attrKeys.map(teardown);
                    attrKeys.map(setup);
                  },
                  destroy() {
                    attrKeys.map(teardown);
                  },
                };
              }

              const code = setAttrs.toString();
              // handle case where we have a wrapper element, in which case the actions are assigned in `Block`.
              if (json.name === 'BlockWrapper') {
                json.hooks.preComponent = { code };

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

              let hasSetAttrsCode = false;
              // handle case where we have no wrapper element, in which case the actions are passed as attributes to our
              // builder blocks.
              traverse(json).forEach(function (item) {
                if (!isMitosisNode(item)) return;

                const filterAttrKeys = Object.entries(item.bindings).filter(
                  ([key, value]) =>
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

                    if (!hasSetAttrsCode) {
                      json.hooks.preComponent = { code };
                      hasSetAttrsCode = true;
                    }
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
