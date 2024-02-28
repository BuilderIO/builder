const traverse = require('traverse');
const seedrandom = require('seedrandom');
const rng = seedrandom('vue-sdk-seed');

/**
 * @typedef {import('@builder.io/mitosis')} Mitosis
 * @typedef {import('@builder.io/mitosis').MitosisNode} MitosisNode
 * @typedef {import('@builder.io/mitosis').StateValue} StateValue
 * @typedef {import('@builder.io/mitosis').MitosisConfig} MitosisConfig
 * @typedef {import('@builder.io/mitosis').Plugin} Plugin
 * @typedef {import('@builder.io/mitosis').OnMountHook} OnMountHook
 */

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
    case 'rsc':
      return 'nextjs';
    default:
      return kebabCase(target);
  }
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
      if (code.includes('BaseText')) {
        return `
import BaseText from '../../blocks/BaseText';
${code}
`;
      }

      if (code.includes('<Text>') && !code.includes('InlinedStyles')) {
        const importStatement = `import BaseText from '../../blocks/BaseText';`;
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

const REMOVE_MAGIC_PLUGIN = () => ({
  json: {
    post: (json) => {
      traverse(json).forEach(function (item) {
        if (!isMitosisNode(item)) return;

        for (const [key, _value] of Object.entries(item.properties)) {
          if (key === 'MAGIC') {
            delete item.properties[key];
          }
        }
      });

      return json;
    },
  },
});

const REMOVE_SET_CONTEXT_PLUGIN_FOR_FORM = () => ({
  code: {
    post: (code) => {
      return code.replace(
        `props.setBuilderContext((PREVIOUS_VALUE) => ({
        ...PREVIOUS_VALUE,
        rootState: combinedState,
      }));`,
        'props.builderContext.rootState = combinedState;'
      );
    },
  },
});

const target = process.argv
  .find((arg) => arg.startsWith('--target='))
  ?.split('=')[1];

const targets = target
  ? [target]
  : ['reactNative', 'rsc', 'vue', 'solid', 'svelte', 'react', 'qwik'];

const INJECT_ENABLE_EDITOR_ON_EVENT_HOOKS_PLUGIN = () => ({
  json: {
    pre: (json) => {
      if (json.name !== 'EnableEditor') return;
      json.hooks.onMount.forEach((onMountHook) => {
        json.hooks.onEvent.forEach((eventHook) => {
          const isEditingHook =
            onMountHook.code.includes('INJECT_EDITING_HOOK_HERE') &&
            eventHook.eventName === 'initeditingbldr';

          if (isEditingHook) {
            onMountHook.code = onMountHook.code.replace(
              'INJECT_EDITING_HOOK_HERE',
              eventHook.code
            );
          }

          const isPreviewingHook =
            onMountHook.code.includes('INJECT_PREVIEWING_HOOK_HERE') &&
            eventHook.eventName === 'initpreviewingbldr';

          if (isPreviewingHook) {
            onMountHook.code = onMountHook.code.replace(
              'INJECT_PREVIEWING_HOOK_HERE',
              eventHook.code
            );
          }
        });

        onMountHook.code = onMountHook.code.replaceAll('elementRef', 'true');
      });

      json.hooks.onEvent = [];
    },
  },
});

/**
 *
 * Identifies all the bindings that are used to pass actions to our blocks.
 * Used by Vue/Svelte plugins to convert the bindings to the appropriate binding syntax.
 *
 * @param {import('@builder.io/mitosis').MitosisComponent} json
 * @param {MitosisNode} item
 */
const filterActionAttrBindings = (json, item) => {
  /**
   * Button component uses `filterAttrs` but calls `DynamicRender`.
   * Special case, we don't want to filter the `filterAttrs` calls even though they are there.
   */
  const isButton = json.name === 'Button';
  if (isButton) return [];

  return Object.entries(item.bindings).filter(([_key, value]) => {
    const blocksAttrs =
      value?.code.includes('filterAttrs') && value.code.includes('true');

    const dynamicRendererAttrs =
      json.name === 'DynamicRenderer' &&
      value?.code.includes('props.actionAttributes');

    return blocksAttrs || dynamicRendererAttrs;
  });
};

/**
 * @type {MitosisConfig}
 */
module.exports = {
  files: 'src/**',
  exclude: ['src/**/*.test.ts'],
  targets,
  getTargetPath,
  commonOptions: {
    plugins: [REMOVE_MAGIC_PLUGIN],
  },
  options: {
    solid: {
      typescript: true,
      plugins: [
        INJECT_ENABLE_EDITOR_ON_EVENT_HOOKS_PLUGIN,
        REMOVE_SET_CONTEXT_PLUGIN_FOR_FORM,
      ],
    },
    vue: {
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

                const filterAttrKeys = filterActionAttrBindings(json, item);

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
      asyncComponentImports: false,
    },
    react: {
      typescript: true,
      plugins: [
        SRCSET_PLUGIN,
        INJECT_ENABLE_EDITOR_ON_EVENT_HOOKS_PLUGIN,
        REMOVE_SET_CONTEXT_PLUGIN_FOR_FORM,
      ],
      stylesType: 'style-tag',
    },
    rsc: {
      explicitImportFileExtension: true,
      typescript: true,
      plugins: [
        SRCSET_PLUGIN,
        REMOVE_SET_CONTEXT_PLUGIN_FOR_FORM,
        () => ({
          json: {
            pre: (json) => {
              if (json.name === 'Symbol') {
                delete json.state.setContent;

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
      typescript: true,
      plugins: [
        SRCSET_PLUGIN,
        BASE_TEXT_PLUGIN,
        INJECT_ENABLE_EDITOR_ON_EVENT_HOOKS_PLUGIN,
        REMOVE_SET_CONTEXT_PLUGIN_FOR_FORM,
        () => ({
          json: {
            pre: (json) => {
              /**
               * We cannot set context in `ComponentRef` because it's a light component.
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

              /**
               * Fix types
               */
              if (json.name === 'CustomCode') {
                json.refs.elementRef.typeParameter = 'any';
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
        /**
         * cleanup `onMount` hooks
         * - rmv unnecessary ones
         * - migrate necessary `onMount` hooks to `useOn('qvisible')` hooks
         */
        () => ({
          json: {
            pre: (json) => {
              if (['Symbol', 'ContentVariants'].includes(json.name)) {
                json.hooks.onMount = [];
                return;
              }

              if (['EnableEditor', 'CustomCode'].includes(json.name)) {
                json.hooks.onMount.forEach((hook, i) => {
                  if (hook.onSSR) return;

                  json.hooks.onMount.splice(i, 1);

                  json.hooks.onEvent.push({
                    code: hook.code.replaceAll('elementRef', 'element'),
                    eventArgName: 'event',
                    eventName: 'qvisible',
                    isRoot: true,
                    refName: 'element',
                    elementArgName: 'element',
                  });
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

              /**
               * `DynamicRenderer` will toggle between
               * <svelte:element> and <svelte:component> depending on the type of the block, while
               * handling empty HTML elements.
               */
              if (json.name === 'DynamicRenderer') {
                traverse(json).forEach(function (item) {
                  if (!isMitosisNode(item)) return;

                  if (!item.name.includes('TagName')) return;

                  item.bindings.this = {
                    type: 'single',
                    ...item.bindings.this,
                    code: item.name,
                  };
                  item.name = `svelte:${item.properties.MAGIC}`;
                });
              }

              // handle case where we have no wrapper element, in which case the actions are passed as attributes to our
              // builder blocks.
              traverse(json).forEach(function (item) {
                if (!isMitosisNode(item)) return;

                const filterAttrKeys = filterActionAttrBindings(json, item);

                for (const [key, value] of filterAttrKeys) {
                  if (value && item.name !== 'svelte:component') {
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
