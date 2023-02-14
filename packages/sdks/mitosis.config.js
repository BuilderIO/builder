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
  if (!value) {
    return;
  }
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
  asyncComponentImports: true,
  plugins: [
    () => ({
      json: {
        // This plugin handles binding our actions to the `v-on:` Vue syntax:
        // - in our block components, the actions will come through `props.attributes` and need to be filtered
        // - in RenderBlock, the actions will be good to go from `state.actions`, and just need the `v-on:` prefix to be removed
        pre: (json) => {
          // this function is injected into a component, so it can't use anything outside of itself
          /**
           *
           * @param {{[index: string]: any}} attrs
           * @param {boolean} isEvent
           * @returns
           */
          function filterAttrs(attrs = {}, isEvent) {
            const eventPrefix = 'v-on:';
            return Object.keys(attrs)
              .filter((attr) => {
                const isEventVal = attr.startsWith(eventPrefix);
                return isEvent ? isEventVal : !isEventVal;
              })
              .reduce(
                (acc, attr) => ({
                  ...acc,
                  [attr.replace(eventPrefix, '')]: attrs[attr],
                }),
                {}
              );
          }
          const FILTER_ATTRIBUTES_CODE = filterAttrs.toString();

          // this function is injected into a component, so it can't use anything outside of itself'
          /**
           * @param {{[index:string]: any}} actions
           */
          function stripVOn(actions = {}) {
            return Object.keys(actions).reduce(
              (acc, attr) => ({
                ...acc,
                [attr.replace('v-on:', '')]: actions[attr],
              }),
              {}
            );
          }

          if (json.name === 'RenderBlock') {
            const STRIP_VON_CODE = stripVOn.toString();

            json.state['stripVOn'] = {
              code: STRIP_VON_CODE,
              type: 'function',
            };
          }

          let hasFilterCode = false;

          traverse(json).forEach(function (item) {
            if (!isMitosisNode(item)) {
              return;
            }

            if (json.name === 'RenderBlock') {
              const key = 'state.actions';
              if (item.bindings[key]) {
                item.bindings[key] = {
                  code: `stripVOn(${item.bindings[key].code})`,
                  type: 'spread',
                  spreadType: 'event-handlers',
                };
              } else {
                return;
              }
            }

            const key = 'props.attributes';
            if (item.bindings[key]) {
              if (!hasFilterCode) {
                hasFilterCode = true;
                json.state['filterAttrs'] = {
                  code: FILTER_ATTRIBUTES_CODE,
                  type: 'function',
                };
              }

              item.bindings['___SPREAD1'] = {
                code: `filterAttrs(${key},  false)`,
                type: 'spread',
                spreadType: 'normal',
              };
              item.bindings['___SPREAD2'] = {
                code: `filterAttrs(${key},  true)`,
                type: 'spread',
                spreadType: 'event-handlers',
              };

              delete item.bindings[key];
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
      plugins: [
        ...(vueConfig?.plugins || []),
        () => ({
          json: {
            pre: (json) => {
              if (json.name === 'Image') {
                json.children[0].name = 'div';
              }

              if (json.name === 'RenderBlock') {
                // drop the wrapper `Show`, move its condition to the root `<template>`
                json.children = json.children[0].children;

                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) {
                    return;
                  }

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
              if (!code.includes("name: 'render-block'")) {
                return code;
              }

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
    rsc: {
      plugins: [
        SRCSET_PLUGIN,
        () => ({
          json: {
            pre: (json) => {
              if (json.name === 'RenderContent') {
                if (!json.state.allRegisteredComponents) {
                  throw new Error(
                    'allRegisteredComponents not found on RenderContent'
                  );
                }
                json.state.allRegisteredComponents.code =
                  json.state.allRegisteredComponents?.code.replace(
                    'as RegisteredComponents',
                    ''
                  );
              }

              return json;
            },
          },
        }),
      ],
    },
    reactNative: {
      plugins: [
        SRCSET_PLUGIN,
        BASE_TEXT_PLUGIN,
        () => ({
          json: {
            pre: (json) => {
              /**
               * We cannot set context in `RenderComponent` because it's a light Qwik component.
               * We only need to set the context for a React Native need: CSS-style inheritance for Text blocks.
               **/
              if (json.name === 'RenderComponent') {
                json.imports.push({
                  imports: {
                    BuilderContext: 'default',
                  },
                  path: '../../context/builder.context.lite',
                });
                json.context.set = {
                  '../../context/builder.context.lite:default': {
                    name: 'BuilderContext',
                    value: {
                      content: {
                        code: 'props.context.content',
                        type: 'property',
                      },
                      state: {
                        code: 'props.context.state',
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
                      registeredComponents: {
                        code: 'props.context.registeredComponents',
                        type: 'property',
                      },
                      inheritedStyles: {
                        code: 'props.context.inheritedStyles',
                        type: 'property',
                      },
                    },
                  },
                };
              }
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
              if (json.name === 'RenderBlock') {
                convertPropertyStateValueToGetter({
                  value: json.state['repeatItemData'],
                  key: 'repeatItemData',
                });

                convertPropertyStateValueToGetter({
                  value: json.state['component'],
                  key: 'component',
                });
              }

              // For now, we exclude the `setState` function as Mitosis does not correctly know how to serialize it.
              Object.values(json.context.set).forEach((context) => {
                if (context?.value?.['setState']) {
                  delete context.value['setState'];
                }
              });

              return json;
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
                    item.name = 'style';
                  }
                });
              }
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
              Object.keys(json.context.set).forEach((contextKey) => {
                const setValue = json.context.set[contextKey];
                if (setValue.name === 'builderContext') {
                  Object.keys(setValue.value || {}).forEach((valueKey) => {
                    const value = setValue.value?.[valueKey];
                    if (value && value.type === 'property') {
                      convertPropertyStateValueToGetter({
                        value,
                        key: valueKey,
                      });
                    }
                  });
                }
              });
            },
          },
        }),
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
              if (json.name === 'RenderInlinedStyles') {
                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) {
                    return;
                  }

                  if (item.bindings.innerHTML) {
                    item.name = 'Fragment';
                    item.bindings.innerHTML.code = 'state.injectedStyleScript';
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
               * Workaround to dynamically provide event handlers to components/elements
               * https://svelte.dev/repl/1246699e266f41218a8eeb45b9b58b54?version=3.24.1
               */
              const code = `
              const setAttrs = (node, attrs = {}) => {
                const attrKeys = Object.keys(attrs)
            
                const setup = attr => node.addEventListener(attr.substr(3), attrs[attr])
                const teardown = attr => node.removeEventListener(attr.substr(3), attrs[attr])
                
                attrKeys.map(setup)
            
                return {
                  update(attrs = {}) {
                    const attrKeys = Object.keys(attrs)
                    attrKeys.map(teardown)
                    attrKeys.map(setup)
                  },
                  destroy() { attrKeys.map(teardown) }
                }
              }
              `;
              // handle case where we have a wrapper element, in which case the actions are assigned in `RenderBlock`.
              if (json.name === 'RenderBlock') {
                json.hooks.preComponent = { code };

                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) {
                    return;
                  }
                  if (item.bindings['state.actions']) {
                    item.bindings['use:setAttrs'] = {
                      code: item.bindings['state.actions'].code,
                      type: 'single',
                    };
                    delete item.bindings['state.actions'];
                  }
                });
                return json;
              } else if (json.name === 'RenderComponent') {
                return json;
              }

              // handle case where we have no wrapper element, in which case the actions are passed as attributes to our
              // builder blocks.
              traverse(json).forEach(function (item) {
                /**
                 * Additional snippet of code that helps split up the attributes into event handlers and the rest.
                 * we can then apply these filters in 2 bindings: one that uses the `setAttrs` action, and another that
                 * provides the non-event-handler attribtues as they are, spread into the component
                 */
                const filterCode = `
                  const isEvent = attr => attr.startsWith('on:')
                  const isNonEvent = attr => !attr.startsWith('on:')

                  const filterAttrs = (attrs = {}, filter) => {
                    const validAttr = {}
                    Object.keys(attrs).forEach(attr => {
                      if (filter(attr)) {
                        validAttr[attr] = attrs[attr]
                      }
                    })
                    return validAttr
                  }
              `;

                if (!isMitosisNode(item)) {
                  return;
                }
                const spreadBinding = Object.entries(item.bindings).find(
                  ([_key, value]) => value?.type === 'spread'
                );

                if (spreadBinding) {
                  const [key, value] = spreadBinding;
                  if (!value) {
                    throw new Error(
                      `Could not find spread binding for ${json.name}`
                    );
                  }
                  json.hooks.preComponent = {
                    code: [filterCode, code].join('\n'),
                  };
                  item.bindings['use:setAttrs'] = {
                    code: `filterAttrs(${value.code}, isEvent)`,
                    type: 'single',
                  };
                  item.bindings[key] = {
                    ...value,
                    code: `filterAttrs(${value.code}, isNonEvent)`,
                  };
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
