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

const ANGULAR_HANDLE_TEMPLATE_STRS = () => ({
  code: {
    post: (code) => {
      const pathValues = code.matchAll(/\[path\]="(.*?)"/g);
      if (pathValues) {
        for (const match of pathValues) {
          const pathValue = match[1];
          const replacedPath = pathValue
            .replaceAll('`', "'")
            .replaceAll('\\', '')
            .replaceAll('.${', ".'+")
            .replaceAll('}', "+'");
          code = code.replace(
            `[path]="${pathValue}"`,
            `[path]="${replacedPath}"`
          );
        }
      }
      if (code.includes('tabs, Tabs')) {
        const classValues = code.matchAll(/\[class\]="(.*?)"/g);
        if (classValues) {
          for (const match of classValues) {
            const classValue = match[1];
            if (classValue.includes('`')) {
              // nasty hack to replace template strings inside tabs component class
              code = code.replace(
                `[class]="${classValue}"`,
                `[class]="'builder-tab-wrap ' + (activeTab === index ? 'builder-tab-active' : '')"`
              );
            }
          }
        }
      }
      return code;
    },
  },
});

// Target Component: "ComponentRef"
// in mitosis we pass props as inputs: { prop1, prop2, etc }
// in this we call inputs: getWrapperProps() directly inside ngComponentOutlet as we don't need to spread the props
const ANGULAR_PASS_CALLED_FUNCTION_TO_INPUTS_NO_NEED_TO_SPREAD = () => ({
  code: {
    post: (code) => {
      if (code.includes('inputs: { getWrapperProps')) {
        const wrapperObj =
          code
            .match(/inputs: {.*?}/s)[0]
            .replace('inputs: {', '')
            .replaceAll('props.', '') + ')';
        const inputsObj = code
          .match(/inputs: {.*?;/s)[0]
          .replace('inputs: ', '');
        code = code.replace(
          inputsObj,
          wrapperObj.replace('context.value', 'context')
        );
      }
      return code;
    },
  },
});

const ANGULAR_REMOVE_UNUSED_LINK_COMPONENT_PROP_PLUGIN = () => ({
  code: {
    post: (code) => {
      if (code.includes('<enable-editor')) {
        code = code.replace('[linkComponent]="linkComponent"', '');
      }
      if (code.includes('<block-wrapper')) {
        code = code.replace('[linkComponent]="linkComponent"', '');
      }
      return code;
    },
  },
});

// for fixing circular dependencies
const ANGULAR_FIX_CIRCULAR_DEPENDENCIES_OF_COMPONENTS = () => ({
  code: {
    post: (code) => {
      if (
        code.includes('component-ref, ComponentRef') ||
        code.includes('repeated-block, RepeatedBlock')
      ) {
        code = code.replace(
          'imports: [CommonModule, Block]',
          'imports: [CommonModule, forwardRef(() => Block)]'
        );
        code = code.replace(
          '} from "@angular/core";',
          `${code.includes('repeated-block') ? ',' : ''}forwardRef } from "@angular/core";`
        );
      }
      return code;
    },
  },
});

const ANGULAR_OVERRIDE_COMPONENT_REF_PLUGIN = () => ({
  code: {
    post: (code) => {
      if (code.includes('component-ref, ComponentRef')) {
        // onInit we check for this.isInteractive as its available at that time
        // and set the Wrapper to InteractiveElement or componentRef
        code = code.replace(
          'ngOnInit() {\n',
          `ngOnInit() {\n  this.Wrapper = this.isInteractive ? InteractiveElement : this.componentRef;\n`
        );
        // we need to wrap the blockChildren in a ngIf to prevent rendering when componentRef is undefined
        code = code.replace(
          '<ng-container *ngFor="let child of blockChildren">',
          '<ng-container *ngIf="componentRef">\n<ng-container *ngFor="let child of blockChildren">'
        );
        code = code.replace(
          '</ng-container>',
          '</ng-container>\n</ng-container>'
        );
      }
      return code;
    },
  },
});

const VALID_HTML_TAGS = [
  'html',
  'base',
  'head',
  'link',
  'meta',
  'style',
  'title',
  'body',
  'address',
  'article',
  'aside',
  'footer',
  'header',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'main',
  'nav',
  'section',
  'blockquote',
  'dd',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'hr',
  'li',
  'menu',
  'ol',
  'p',
  'pre',
  'ul',
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'dfn',
  'em',
  'i',
  'kbd',
  'mark',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr',
  'area',
  'audio',
  'img',
  'map',
  'track',
  'video',
  'embed',
  'iframe',
  'object',
  'param',
  'picture',
  'portal',
  'source',
  'svg',
  'math',
  'canvas',
  'noscript',
  'script',
  'del',
  'ins',
  'caption',
  'col',
  'colgroup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'button',
  'datalist',
  'fieldset',
  'form',
  'input',
  'label',
  'legend',
  'meter',
  'optgroup',
  'option',
  'output',
  'progress',
  'select',
  'textarea',
  'details',
  'dialog',
  'summary',
  'slot',
  'template',
  // tags below are SVG tags. See the below article for list of SVG tags
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element
  'animate',
  'animateMotion',
  'animateTransform',
  'circle',
  'clipPath',
  'defs',
  'desc',
  'discard',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'foreignObject',
  'g',
  'hatch',
  'hatchpath',
  'image',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'metadata',
  'mpath',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'set',
  'stop',
  'switch',
  'symbol',
  'text',
  'textPath',
  'tspan',
  'use',
  'view',
];

const ANGULAR_COMPONENT_NAMES_HAVING_HTML_TAG_NAMES = () => ({
  json: {
    pre: (json) => {
      if (VALID_HTML_TAGS.includes(json.name.toLowerCase())) {
        json.name = `Builder${json.name}`;
      }
    },
  },
});

const BLOCKS = [
  'builder-button',
  'builder-image',
  'columns',
  'custom-code',
  'builder-embed',
  'img-component',
  'raw-text',
  'section-component',
  'builder-slot',
  'builder-symbol',
  'builder-textarea',
  'builder-video',
];

/**
 * As in Angular we can't spread arbitrary props in a component,
 * template: `<component2 {...attributes} />` will not work.
 * So, in our current mitosis implementation we send it as an object
 * template: `<component2 [wrapperProps]="{...attributes}" />`
 * Here we spread them to respective props/inputs in the component.
 */
const ANGULAR_BLOCKS_PLUGIN = () => ({
  code: {
    post: (code) => {
      if (BLOCKS.some((block) => code.includes(block))) {
        const inputNames = code.match(/@Input\(\) (.*)!:/g);
        const inputs = inputNames.map((input) => {
          return input.replace('@Input() ', '').replace('!:', '');
        });

        const inputsTillEnd = code.match(/@Input\(\) (.*);/g);
        code = code.replace(
          inputsTillEnd[inputsTillEnd.length - 1],
          `${inputsTillEnd[inputsTillEnd.length - 1]}\n  @Input() wrapperProps: any;`
        );

        const propInitStr = `
        const properties = [${inputs.map((input) => `'${input}'`).join(', ')}];
        properties.forEach(prop => {
          if (this.wrapperProps && Object.prototype.hasOwnProperty.call(this.wrapperProps, prop)) {
            this[prop] = this.wrapperProps[prop];
          }
        });
        `;

        if (code.includes('ngOnInit')) {
          code = code.replace(
            'ngOnInit() {',
            `ngOnInit() {\n
              ${propInitStr}
            `
          );
        } else {
          const lastEndIndex = code.lastIndexOf('}');
          code = `${code.slice(0, lastEndIndex)}ngOnInit() {
            ${propInitStr}
          }
          ${code.slice(lastEndIndex)}`;
        }
      }
      return code;
    },
  },
});

const ANGULAR_BIND_THIS_FOR_WINDOW_EVENTS = () => ({
  code: {
    post: (code) => {
      if (code.includes('enable-editor')) {
        code = code.replace(
          'window.addEventListener("message", this.processMessage);',
          'window.addEventListener("message", this.processMessage.bind(this));'
        );
        code = code.replace(
          `window.addEventListener(
            "builder:component:stateChangeListenerActivated",
            this.emitStateUpdate
          );`,
          `window.addEventListener(
            "builder:component:stateChangeListenerActivated",
            this.emitStateUpdate.bind(this)
          );`
        );
        code = code.replace('onClick: onClick', 'onClick: onClick.bind(this)');
        code = code.replace('ngAfterContentChecked', 'ngOnChanges');
      }

      if (code.includes('blocks-wrapper')) {
        code = code.replace(
          'onClick: onClick, onMouseEnter: onMouseEnter, onKeyPress: onClick',
          'onClick: onClick.bind(this), onMouseEnter: onMouseEnter.bind(this), onKeyPress: onClick.bind(this)'
        );
      }

      return code;
    },
  },
});

// required for registering custom components properly
const ANGULAR_INITIALIZE_PROP_ON_NG_ONINIT = () => ({
  code: {
    post: (code) => {
      if (code.includes('content-component, ContentComponent')) {
        const registeredComponentsCode = code.match(
          /registeredComponents = \[.*\);/s
        );
        const builderContextSignalCode = code.match(
          /builderContextSignal = \{.*\};/s
        );

        // add them to ngOnInit
        code = code.replace(
          // last } before the end of the class
          /}\n\s*$/,
          `
            ngOnInit() {
              this.${registeredComponentsCode}
              this.${builderContextSignalCode}
            }
          }
          `
        );
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
      plugins: [
        ANGULAR_HANDLE_TEMPLATE_STRS,
        ANGULAR_PASS_CALLED_FUNCTION_TO_INPUTS_NO_NEED_TO_SPREAD,
        ANGULAR_REMOVE_UNUSED_LINK_COMPONENT_PROP_PLUGIN,
        ANGULAR_FIX_CIRCULAR_DEPENDENCIES_OF_COMPONENTS,
        ANGULAR_OVERRIDE_COMPONENT_REF_PLUGIN,
        ANGULAR_COMPONENT_NAMES_HAVING_HTML_TAG_NAMES,
        ANGULAR_BLOCKS_PLUGIN,
        INJECT_ENABLE_EDITOR_ON_EVENT_HOOKS_PLUGIN,
        ANGULAR_BIND_THIS_FOR_WINDOW_EVENTS,
        ANGULAR_INITIALIZE_PROP_ON_NG_ONINIT,
      ],
    },
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
