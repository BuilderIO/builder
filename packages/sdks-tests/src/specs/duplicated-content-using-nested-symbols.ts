const SYMBOL_CONTENT = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1718342822371,
  id: '853f03cb79aa4a05b5742cf53cd3d40d',
  '@version': 4,
  name: 'mysymbol1234',
  modelId: '5e1209efea0045f58d9b871d81b652fa',
  published: 'published',
  meta: {
    kind: 'component',
    lastPreviewUrl:
      'https://preview.builder.codes?model=symbol&previewing=true&apiKey=ad30f9a246614faaa6a03374f83554c9&builder.space=ad30f9a246614faaa6a03374f83554c9&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=symbol&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.symbol=853f03cb79aa4a05b5742cf53cd3d40d&builder.overrides.853f03cb79aa4a05b5742cf53cd3d40d=853f03cb79aa4a05b5742cf53cd3d40d&builder.options.locale=Default',
    hasLinks: false,
  },
  priority: -521,
  stage: 'b3ee01559a244a078973f545ad475eba',
  query: [],
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-161790216c794a2bb79111674497bd2d',
        meta: {
          previousId: 'builder-00d86dfba4d04233a1a0c9ddd505b366',
        },
        component: {
          name: 'Text',
          options: {
            text: 'Enter some text...',
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
            color: 'blue',
            border: '1px solid currentColor',
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
  lastUpdated: 1724059046832,
  firstPublished: 1718342822371,
  testRatio: 1,
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};

export const DUPLICATED_CONTENT_USING_NESTED_SYMBOLS = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1729851533751,
  id: 'b664dc1625414177bcb3024c6cf7747f',
  '@version': 4,
  name: 'Symbol1',
  modelId: '5e1209efea0045f58d9b871d81b652fa',
  published: 'published',
  meta: {
    lastPreviewUrl:
      'http://localhost:5173/?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=symbol&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.symbol=b664dc1625414177bcb3024c6cf7747f&builder.overrides.b664dc1625414177bcb3024c6cf7747f=b664dc1625414177bcb3024c6cf7747f&builder.options.locale=Default',
    hasLinks: false,
    symbolsUsed: {
      '853f03cb79aa4a05b5742cf53cd3d40d': true,
    },
    kind: 'component',
  },
  priority: -755,
  stage: 'b3ee01559a244a078973f545ad475eba',
  query: [],
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-81baea6a3cde408986131f715b079051',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              content: SYMBOL_CONTENT,
              data: {},
              model: 'symbol',
              entry: '853f03cb79aa4a05b5742cf53cd3d40d',
              ownerId: 'ad30f9a246614faaa6a03374f83554c9',
            },
          },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
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
  lastUpdated: 1729861437548,
  firstPublished: 1729851533751,
  testRatio: 1,
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};

export const ADD_A_TEXT_BLOCK = {
  id: 'b664dc1625414177bcb3024c6cf7747f',
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-81baea6a3cde408986131f715b079051',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              content: SYMBOL_CONTENT,
              data: {},
              model: 'symbol',
              entry: '853f03cb79aa4a05b5742cf53cd3d40d',
              ownerId: 'ad30f9a246614faaa6a03374f83554c9',
            },
          },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-54df3300fcf74401baba5e3ec0661e9c',
        component: {
          name: 'Text',
          options: {
            text: 'something other than the symbol!',
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
    ],
  },
};
