export const JS_CODE_CONTENT = {
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  folders: [],
  data: {
    jsCode: 'state.menu={a:{b:{expanded:!0}}}',
    inputs: [],
    newField3: 'testing',
    themeId: false,
    title: 'js-code',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          show: 'var _virtual_index=state.menu.a.b.expanded;return _virtual_index',
        },
        id: 'builder-165c8701ec8846ddbb2c992aac25ca43',
        component: {
          name: 'Text',
          options: {
            text: 'Content is expanded',
          },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            lineHeight: 'normal',
            height: 'auto',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        actions: {
          click: 'state.menu.a.b.expanded=!state.menu.a.b.expanded',
        },
        id: 'builder-54da80f81b584020bd09a4bee2d12cbd',
        meta: {
          eventActions: {
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:customCode',
                options: {
                  code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\n\nstate.menu.a.b.expanded = !state.menu.a.b.expanded',
                },
              },
            ],
          },
        },
        component: {
          name: 'Core:Button',
          options: {
            text: 'toggle menu',
            openLinkInNewTab: false,
          },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            appearance: 'none',
            paddingTop: '15px',
            paddingBottom: '15px',
            paddingLeft: '25px',
            paddingRight: '25px',
            backgroundColor: 'black',
            color: 'white',
            borderRadius: '4px',
            textAlign: 'center',
            cursor: 'pointer',
          },
        },
      },
    ],
    url: '/js-code',
    state: {
      deviceSize: 'large',
      location: {
        pathname: '/js-code',
        path: ['js-code'],
        query: {},
      },
      menu: { a: { b: { expanded: true } } },
    },
  },
  modelId: '240a12053d674735ac2a384dcdc561b5',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/js-code',
      operator: 'is',
    },
  ],
  published: 'draft',
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Ff51fd03100f64db6ae650500738224d8',
  testRatio: 1,
  lastUpdated: 1698688645725,
  createdDate: 1698688306886,
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'https://preview.builder.codes?model=page&previewing=true&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=7a66536056b7451a9f7c372eb3d665bb&builder.overrides.7a66536056b7451a9f7c372eb3d665bb=7a66536056b7451a9f7c372eb3d665bb&builder.overrides.page:/=7a66536056b7451a9f7c372eb3d665bb&builder.options.locale=Default',
    hasLinks: false,
  },
  variations: {},
  name: 'js-code',
  id: '7a66536056b7451a9f7c372eb3d665bb',
  rev: '4ln38bhry8',
};
