export const DYNAMIC_LOADING_CUSTOM_COMPONENTS = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1727698733481,
  id: 'ecb200c7c9954212a276b1071a376f18',
  '@version': 4,
  name: 'fsafsggxz',
  modelId: '17c6065109ef4062ba083f5741f4ee6a',
  published: 'published',
  meta: {
    lastPreviewUrl:
      'http://localhost:5173/fsafsggxz?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=ecb200c7c9954212a276b1071a376f18&builder.overrides.ecb200c7c9954212a276b1071a376f18=ecb200c7c9954212a276b1071a376f18&builder.overrides.page:/fsafsggxz=ecb200c7c9954212a276b1071a376f18&builder.options.locale=Default',
    kind: 'page',
    hasLinks: false,
    componentsUsed: {
      LazyComponent: 1,
    },
  },
  priority: -718,
  stage: 'b3ee01559a244a078973f545ad475eba',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/fsafsggxz',
    },
  ],
  data: {
    title: 'fsafsggxz',
    themeId: false,
    tsCode: 'state.show = false',
    jsCode: 'var _virtual_index=state.show=!1;return _virtual_index',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        actions: {
          click: 'state.show=!state.show',
        },
        code: {
          actions: {
            click: 'state.show = !state.show;\n',
          },
        },
        id: 'builder-2b8ddc89b1894011b3aa3309833bf3b9',
        meta: {
          eventActions: {
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:toggleState',
                options: {
                  name: 'show',
                },
              },
            ],
          },
        },
        component: {
          name: 'Core:Button',
          options: {
            text: 'Click me!',
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
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          show: 'var _virtual_index=state.show;return _virtual_index',
        },
        code: {
          bindings: {
            show: 'state.show',
          },
        },
        id: 'builder-5a8cdbbf69f14c79a4fa71438c8fd4cf',
        component: {
          name: 'LazyComponent',
          options: {},
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          show: 'var _virtual_index=state.show;return _virtual_index',
        },
        code: {
          bindings: {
            show: 'state.show',
          },
        },
        id: 'builder-caf4d18da3d0439281f29eb144874e2e',
        component: {
          name: 'NotLazyComponent',
          options: {},
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
          },
        },
      },
    ],
  },
  metrics: {
    clicks: 0,
    impressions: 0,
  },
  variations: {},
  lastUpdated: 1727704258246,
  firstPublished: 1727704258239,
  testRatio: 1,
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};
