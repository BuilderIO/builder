const traverse = require('traverse');
const seedrandom = require('seedrandom');
const rng = seedrandom('vue-sdk-seed');

/**
 * @typedef {import('@builder.io/mitosis')} Mitosis
 * @typedef {import('@builder.io/mitosis').MitosisNode} MitosisNode
 * @typedef {import('@builder.io/mitosis').StateValue} StateValue
 * @typedef {import('@builder.io/mitosis').MitosisConfig} MitosisConfig
 * @typedef {import('@builder.io/mitosis').MitosisPlugin} Plugin
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
 * @type {Plugin}
 */
const FETCHPRIORITY_CAMELCASE_PLUGIN = () => ({
  code: {
    pre: (code) => {
      return code.replace(/fetchpriority=/g, 'fetchPriority=');
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
  : [
      'reactNative',
      'rsc',
      'vue',
      'solid',
      'svelte',
      'react',
      'qwik',
      'angular',
    ];

/**
 * @type {Plugin}
 */
const ADD_IS_STRICT_STYLE_MODE_TO_CONTEXT_PLUGIN = () => ({
  json: {
    pre: (json) => {
      if (json.name !== 'ContentComponent') return json;

      json.state.builderContextSignal.code =
        json.state.builderContextSignal.code.replace(
          /^\s*{/,
          '{strictStyleMode: props.strictStyleMode,'
        );

      return json;
    },
  },
});

const MEMOIZING_BLOCKS_COMPONENT_PLUGIN = () => ({
  json: {
    post: (json) => {
      if (json.name === 'Block') {
        json.imports.push({
          imports: { memo: 'memo' },
          path: 'react',
        });
      }
      if (json.name === 'Blocks') {
        json.imports.push({
          imports: { memo: 'memo' },
          path: 'react',
        });

        json.hooks.init = {
          code: `
            ${json.hooks.init?.code || ''}
            const renderItem = React.useCallback(({ item }: { item: any }) => (
              <Block
                block={item}
                linkComponent={props.linkComponent}
                context={props.context || builderContext}
                registeredComponents={
                  props.registeredComponents || componentsContext?.registeredComponents
                }
              />
            ), [
              props.linkComponent,
              props.context,
              props.registeredComponents,
              builderContext,
              componentsContext?.registeredComponents
            ]);
          
            // Memoize keyExtractor
            const keyExtractor = React.useCallback((item: any) => 
              item.id.toString()
            , []);
          `,
        };

        if (json.children[0].children[1].children[0].name !== 'For') {
          throw new Error(
            'Blocks component must have a For block that will get converted to a FlatList'
          );
        }

        json.children[0].children[1].children[0] = {
          '@type': '@builder.io/mitosis/node',
          name: 'FlatList',
          meta: {},
          scope: {},
          properties: {},
          bindings: {
            data: { code: 'props.blocks', type: 'single' },
            renderItem: { code: 'renderItem', type: 'single' },
            keyExtractor: { code: 'keyExtractor', type: 'single' },
            removeClippedSubviews: { code: 'true', type: 'single' },
            maxToRenderPerBatch: { code: '10', type: 'single' },
            windowSize: { code: '5', type: 'single' },
            initialNumToRender: { code: '5', type: 'single' },
          },
          children: [],
        };
      }
      return json;
    },
  },
  code: {
    post: (code, json) => {
      if (json.name === 'Blocks') {
        return code.replace(
          'export default Blocks',
          'export default memo(Blocks)'
        );
      }
      if (json.name === 'Block') {
        return code.replace(
          'export default Block',
          'export default memo(Block)'
        );
      }
      return code;
    },
  },
});

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
 * @type {Plugin}
 */
const REMOVE_UNUSED_PROPS_HACK_PLUGIN = () => ({
  json: {
    post: (json) => {
      json.hooks.onMount = json.hooks.onMount.filter(
        (hook) =>
          !hook.code.includes('/** this is a hack to include unused props */')
      );
      return json;
    },
  },
});

// for fixing circular dependencies
/**
 * @type {Plugin}
 */
const ANGULAR_FIX_CIRCULAR_DEPENDENCIES_OF_COMPONENTS = () => ({
  code: {
    post: (code) => {
      if (
        code.includes('selector: "component-ref"') ||
        code.includes('selector: "repeated-block"')
      ) {
        code = code.replace(
          'imports: [CommonModule, Block]',
          'imports: [CommonModule, forwardRef(() => Block)]'
        );

        // First try to match multiline imports
        const multilineImport = code.match(
          /import\s*{[\s\S]*?}[\s\S]*?from\s*["']@angular\/core["'];/
        );

        if (multilineImport) {
          // Extract the content inside braces
          const importContent = multilineImport[0].match(/{[\s\S]*?}/)[0];
          const cleanedContent = importContent.replace(/[{}]/g, '').trim();

          // Check if forwardRef is already imported
          if (!cleanedContent.includes('forwardRef')) {
            // Add forwardRef to the import
            const newImport = multilineImport[0].replace(
              importContent,
              `{ ${cleanedContent}${cleanedContent.endsWith(',') ? ' ' : ', '}forwardRef }`
            );

            code = code.replace(multilineImport[0], newImport);
          }
        } else {
          // Fallback to single line import matching
          const singleLineImport = code.match(
            /import\s+{(.*?)}\s+from\s+["']@angular\/core["'];/
          );

          if (singleLineImport) {
            const importedItems = singleLineImport[1].trim();

            if (!importedItems.includes('forwardRef')) {
              const newImport = `import { ${importedItems}${importedItems.endsWith(',') ? ' ' : ', '}forwardRef } from "@angular/core";`;
              code = code.replace(singleLineImport[0], newImport);
            }
          }
        }
      }
      return code;
    },
  },
});

const ANGULAR_INJECT_UPDATE_VIEW_CODE = () => ({
  json: {
    post: (json) => {
      if (json.name === 'BlocksWrapper') {
        json.compileContext.angular.hooks.ngAfterContentChecked = {
          code: `if (this.shouldUpdate()) { this._updateView(); this.shouldUpdate.set(false); }`,
        };
      }
      return json;
    },
  },
});

const HAS_ATTRIBUTES_INPUT_METHOD = `hasAttributesInput(component): boolean {
  return !!reflectComponentType(component)?.inputs.find(input => input.propName === 'attributes');
}`;

const UPDATE_ATTRIBUTES_METHOD = `updateAttributes(
    el: HTMLElement,
    attributes: { [key: string]: any }
  ): void {
    Object.keys(attributes).forEach((attr) => {
      if (attr.startsWith("on")) {
        if (this._listenerFns.has(attr)) {
          this._listenerFns.get(attr)!();
        }
        this._listenerFns.set(
          attr,
          this.renderer.listen(
            el,
            attr.replace("on", "").toLowerCase(),
            attributes[attr]
          )
        );
      } else if (attr === 'class' && attributes[attr]) {
        const classes = attributes[attr].split(' ');
        classes.forEach((cls: string) =>
          this.renderer.addClass(el, cls.trim())
        );
      } else {
        this.renderer.setAttribute(el, attr.toLowerCase(), attributes[attr] ?? "");
      }
    });
  }`;

const ATTACH_ATTRIBUTES_METHOD = `if (!this.hasAttributesInput(this.Wrapper())) {
  const wrapperElement = this.wrapperTemplateRef()?.elementRef.nativeElement?.nextElementSibling;
  if (wrapperElement) {
    this.updateAttributes(wrapperElement, this.attributes());
  }
}`;

const FILTER_PROPS_METHOD = `filterPropsThatWrapperNeeds(allProps: any) {
    const definedPropNames = reflectComponentType(this.Wrapper()).inputs.map(prop => prop.propName);
    return definedPropNames.reduce((acc, propName) => {
      acc[propName] = allProps[propName];
      return acc;
    }, {});
  }`;

const ANGULAR_NO_WRAP_INTERACTIVE_ELEMENT_PLUGIN = () => ({
  json: {
    pre: (json) => {
      if (json.name === 'InteractiveElement') {
        json.imports.push({
          imports: { reflectComponentType: 'reflectComponentType' },
          path: '@angular/core',
        });
        json.state['_listenerFns'] = {
          code: `new Map()`,
          type: 'single',
        };
        json.state['hasAttributesInput'] = {
          code: HAS_ATTRIBUTES_INPUT_METHOD,
          type: 'method',
        };
        json.state['filterPropsThatWrapperNeeds'] = {
          code: FILTER_PROPS_METHOD,
          type: 'method',
        };
        json.state['updateAttributes'] = {
          code: UPDATE_ATTRIBUTES_METHOD,
          type: 'method',
        };
        json.compileContext.angular.hooks.ngAfterViewInit = {
          code: ATTACH_ATTRIBUTES_METHOD,
        };

        if (!json.hooks.onUnMount) {
          json.hooks.onUnMount = {
            code: `
         for (const fn of this._listenerFns.values()) {
            fn();
          }
          `,
          };
        }
      }
      return json;
    },
  },
  code: {
    post: (code, json) => {
      if (json.name === 'InteractiveElement') {
        code = code.replace(
          'attributes = ',
          `private _listenerFns = new Map();
        attributes = `
        );
        code = code.replace(
          'attributes: this.attributes()',
          '...(this.hasAttributesInput(this.Wrapper()) && { attributes: this.attributes() })'
        );
        code = code.replace(
          '...this.targetWrapperProps()',
          '...(this.filterPropsThatWrapperNeeds(this.targetWrapperProps()))'
        );
      }
      return code;
    },
  },
});

const QWIK_ONUPDATE_TO_USEVISIBLETASK = () => ({
  code: {
    post: (code, json) => {
      if (json.name === 'CustomCode') {
        code = code.replace('useTask$(', 'useVisibleTask$(');
      }
      return code;
    },
  },
});

const QWIK_FORCE_RENDER_COUNT_FOR_RENDERING_CUSTOM_COMPONENT_DEFAULT_VALUE =
  () => ({
    json: {
      post: (json) => {
        if (json.name === 'InteractiveElement') {
          json.children[0].meta.else.bindings['key'] = {
            code: "'wrapper-' + state.forceRenderCount",
            bindingType: 'expression',
            type: 'single',
          };
        }
      },
    },
  });

/**
 * @type {Plugin}
 */
const VUE_FIX_EXTRA_ATTRS_PLUGIN = () => ({
  json: {
    pre: (json) => {
      if (json.name === 'InteractiveElement') {
        delete json.children[0].meta.else.bindings.attributes;
      }

      return json;
    },
  },
});

const REACT_NATIVE_IMPORT_COMPONENTS_PLUGIN = () => ({
  json: {
    post: (json) => {
      if (json.name === 'Content' || json.name === 'EnableEditor') {
        json.imports.push({
          imports: { ScrollView: 'ScrollView' },
          path: 'react-native',
        });
      }

      if (json.name === 'Block') {
        json.imports.push({
          imports: { View: 'View' },
          path: 'react-native',
        });
      }
    },
  },
});

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
    angular: {
      standalone: true,
      typescript: true,
      state: 'class-properties',
      api: 'signals',
      defaultExportComponents: true,
      plugins: [
        ANGULAR_FIX_CIRCULAR_DEPENDENCIES_OF_COMPONENTS,
        INJECT_ENABLE_EDITOR_ON_EVENT_HOOKS_PLUGIN,
        ANGULAR_INJECT_UPDATE_VIEW_CODE,
        ANGULAR_NO_WRAP_INTERACTIVE_ELEMENT_PLUGIN,
      ],
    },
    solid: {
      typescript: true,
      stylesType: 'style-tag',
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
        REMOVE_UNUSED_PROPS_HACK_PLUGIN,
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
        VUE_FIX_EXTRA_ATTRS_PLUGIN,
      ],
      api: 'options',
      asyncComponentImports: false,
    },
    react: {
      typescript: true,
      plugins: [
        SRCSET_PLUGIN,
        FETCHPRIORITY_CAMELCASE_PLUGIN,
        INJECT_ENABLE_EDITOR_ON_EVENT_HOOKS_PLUGIN,
        REMOVE_SET_CONTEXT_PLUGIN_FOR_FORM,
      ],
      stylesType: 'style-tag',
      styleTagsPlacement: 'top',
    },
    rsc: {
      explicitImportFileExtension: true,
      typescript: true,
      plugins: [
        SRCSET_PLUGIN,
        FETCHPRIORITY_CAMELCASE_PLUGIN,
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
        ADD_IS_STRICT_STYLE_MODE_TO_CONTEXT_PLUGIN,
        MEMOIZING_BLOCKS_COMPONENT_PLUGIN,
        REACT_NATIVE_IMPORT_COMPONENTS_PLUGIN,
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

              /**
               * Fix component name as `Button` is imported from react-native
               */
              if (json.name === 'Button') {
                json.name = 'BuilderButton';
              }
            },
          },
        }),
        () => ({
          code: {
            post: (code) => {
              if (
                code.includes('BlocksWrapper') ||
                code.includes('EnableEditor')
              ) {
                /**
                 * Replaces `onPress` event handler with `onClick` for React Native
                 * such that visual editing "+Add Block" works on web target.
                 */
                code = code.replace('onPress', 'onClick');
              }
              return code;
            },
          },
        }),
      ],
    },
    qwik: {
      typescript: true,
      plugins: [
        FETCHPRIORITY_CAMELCASE_PLUGIN,
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

              if (['EnableEditor'].includes(json.name)) {
                json.hooks.onMount.forEach((hook, i) => {
                  if (hook.onSSR) return;

                  json.hooks.onMount.splice(i, 1);

                  json.hooks.onEvent.push({
                    code: hook.code.replaceAll('elementRef', 'element'),
                    eventArgName: 'event',
                    eventName: 'readystatechange',
                    isRoot: true,
                    refName: 'element',
                    elementArgName: 'element',
                  });
                });
              }
            },
            post: (json) => {
              if (json.name !== 'EnableEditor') return;
              json.imports.push({
                imports: { useOnDocument: 'useOnDocument' },
                path: '@builder.io/qwik',
              });
              return json;
            },
          },
          code: {
            post: (code, json) => {
              if (json.name === 'EnableEditor') {
                code = code.replaceAll(
                  `useOn(
    "readystatechange"`,
                  `useOnDocument(
    "readystatechange"`
                );
              }
              return code;
            },
          },
        }),
        QWIK_FORCE_RENDER_COUNT_FOR_RENDERING_CUSTOM_COMPONENT_DEFAULT_VALUE,
        QWIK_ONUPDATE_TO_USEVISIBLETASK,
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
