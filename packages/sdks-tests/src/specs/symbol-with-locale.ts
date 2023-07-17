export const DEFAULT_TEXT_SYMBOL = {
  lastUpdatedBy: 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
  folders: [],
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-90ec911111a94f0aa3e0ee1860388d93',
        meta: {
          previousId: 'builder-29bab71fac7043eb921eb530a3203e5f',
          'transformed.text': 'localized',
          localizedTextInputs: ['text'],
        },
        component: {
          name: 'Text',
          options: {
            text: '<span style="display: block;" class="builder-paragraph">Default text</span>',
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
        id: 'builder-pixel-hdkrkco2lk9',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
          'aria-hidden': 'true',
          alt: '',
          role: 'presentation',
          width: '0',
          height: '0',
        },
        responsiveStyles: {
          large: {
            height: '0',
            width: '0',
            display: 'inline-block',
            opacity: '0',
            overflow: 'hidden',
            pointerEvents: 'none',
          },
        },
      },
    ],
    state: { deviceSize: 'large', location: { path: '', query: {} } },
  },
  modelId: 'd661dd1d06ce43ddbe3c2fe35597e545',
  query: [],
  published: 'published',
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F2072bf01f23f4d929d2f459fc900e61c',
  firstPublished: 1687808895615,
  testRatio: 1,
  lastUpdated: 1687808953907,
  createdDate: 1687808895615,
  createdBy: 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
  meta: {
    kind: 'component',
    lastPreviewUrl:
      'https://preview.builder.codes?model=symbol&previewing=true&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=symbol&builder.noCache=true&__builder_editing__=true&builder.overrides.symbol=e2a166f7d9544ed9ade283abf9491af3&builder.overrides.e2a166f7d9544ed9ade283abf9491af3=e2a166f7d9544ed9ade283abf9491af3&builder.options.locale=Default',
    hasLinks: false,
  },
  variations: {},
  name: 'Locale symbol',
  id: 'e2a166f7d9544ed9ade283abf9491af3',
  rev: 'znwd06q4jua',
} as const;

export const CONTENT = {
  lastUpdatedBy: 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
  folders: [],
  data: {
    inputs: [],
    themeId: false,
    title: 'symbol with locale',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-29bab71fac7043eb921eb530a3203e5f',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              entry: 'e2a166f7d9544ed9ade283abf9491af3',
              model: 'symbol',
              data: {},
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
        actions: { click: 'var _virtual_index=state.locale="fr";return _virtual_index' },
        id: 'builder-bfbb2ae098f74d90ac94922f4cc18ff7',
        meta: {
          eventActions: {
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:customCode',
                options: { code: "state.locale = 'fr'" },
              },
            ],
          },
        },
        component: { name: 'Core:Button', options: { text: 'click', openLinkInNewTab: false } },
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
        id: 'builder-pixel-gie7gk6gv5w',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
          'aria-hidden': 'true',
          alt: '',
          role: 'presentation',
          width: '0',
          height: '0',
        },
        responsiveStyles: {
          large: {
            height: '0',
            width: '0',
            display: 'inline-block',
            opacity: '0',
            overflow: 'hidden',
            pointerEvents: 'none',
          },
        },
      },
    ],
    url: '/symbol-with-locale',
    state: { deviceSize: 'large', location: { path: '', query: {} } },
  },
  modelId: '240a12053d674735ac2a384dcdc561b5',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/symbol-with-locale',
      operator: 'is',
    },
  ],
  published: 'published',
  firstPublished: 1687809092354,
  testRatio: 1,
  lastUpdated: 1687809475739,
  createdDate: 1687808851184,
  createdBy: 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'http://127.0.0.1:5173/symbol-with-locale?builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=d5721e2b572047149ec96a4588ab576f&builder.overrides.d5721e2b572047149ec96a4588ab576f=d5721e2b572047149ec96a4588ab576f&builder.overrides.page:/symbol-with-locale=d5721e2b572047149ec96a4588ab576f&builder.options.locale=Default',
    hasLinks: false,
    symbolsUsed: { e2a166f7d9544ed9ade283abf9491af3: true },
  },
  variations: {},
  name: 'symbol with locale',
  id: 'd5721e2b572047149ec96a4588ab576f',
  rev: 'as1tvtsbc2u',
} as const;

export const FRENCH_TEXT_SYMBOL = {
  lastUpdatedBy: 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
  folders: [],
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-90ec911111a94f0aa3e0ee1860388d93',
        meta: {
          previousId: 'builder-29bab71fac7043eb921eb530a3203e5f',
          'transformed.text': 'localized',
          localizedTextInputs: ['text'],
        },
        component: {
          name: 'Text',
          options: {
            text: '<span style="display: block;" class="builder-paragraph">French text</span>',
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
        id: 'builder-pixel-g02jiz217i7',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
          'aria-hidden': 'true',
          alt: '',
          role: 'presentation',
          width: '0',
          height: '0',
        },
        responsiveStyles: {
          large: {
            height: '0',
            width: '0',
            display: 'inline-block',
            opacity: '0',
            overflow: 'hidden',
            pointerEvents: 'none',
          },
        },
      },
    ],
    state: { deviceSize: 'large', location: { path: '', query: {} } },
  },
  modelId: 'd661dd1d06ce43ddbe3c2fe35597e545',
  query: [],
  published: 'published',
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F2072bf01f23f4d929d2f459fc900e61c',
  firstPublished: 1687808895615,
  testRatio: 1,
  lastUpdated: 1687808953907,
  createdDate: 1687808895615,
  createdBy: 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
  meta: {
    kind: 'component',
    lastPreviewUrl:
      'https://preview.builder.codes?model=symbol&previewing=true&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=symbol&builder.noCache=true&__builder_editing__=true&builder.overrides.symbol=e2a166f7d9544ed9ade283abf9491af3&builder.overrides.e2a166f7d9544ed9ade283abf9491af3=e2a166f7d9544ed9ade283abf9491af3&builder.options.locale=Default',
    hasLinks: false,
  },
  variations: {},
  name: 'Locale symbol',
  id: 'e2a166f7d9544ed9ade283abf9491af3',
  rev: 'upgeuaxb42',
} as const;
