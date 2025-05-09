export const LOCALIZATION_SUBFIELDS = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1733998720578,
  id: 'ded8620c332b4315b69afc3bb957831e',
  '@version': 4,
  name: 'loc-subfields',
  modelId: '17c6065109ef4062ba083f5741f4ee6a',
  published: 'draft',
  meta: {
    hasLinks: false,
    kind: 'page',
    lastPreviewUrl:
      'http://localhost:5173/loc-subfields?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers%2CeditContentPriority&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=ded8620c332b4315b69afc3bb957831e&builder.overrides.ded8620c332b4315b69afc3bb957831e=ded8620c332b4315b69afc3bb957831e&builder.overrides.page:/loc-subfields=ded8620c332b4315b69afc3bb957831e&builder.options.locale=Default',
    componentsUsed: {
      ComponentWithLocalizedSubfields: 1,
    },
  },
  priority: -825,
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/loc-subfields',
    },
  ],
  data: {
    themeId: false,
    title: 'loc-subfields',
    inputs: [],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-c550aa8a34804f3097eb46f76baa15d4',
        meta: {
          'transformed.texts.0.text1': 'localized',
          localizedTextInputs: ['texts.0.text1', 'texts.0.text2'],
          'transformed.texts.0.text2': 'localized',
        },
        component: {
          name: 'ComponentWithLocalizedSubfields',
          options: {
            texts: [
              {
                text1: {
                  '@type': '@builder.io/core:LocalizedValue',
                  Default: 'hello',
                  'hi-IN': 'namaste',
                },
                text2: {
                  '@type': '@builder.io/core:LocalizedValue',
                  Default: 'world',
                  'hi-IN': 'duniya',
                },
              },
            ],
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
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          'component.options.text': 'var _virtual_index=state.header;return _virtual_index',
        },
        code: {
          bindings: {
            'component.options.text': 'state.header',
          },
        },
        id: 'builder-f76bb010047a44f3bbb18ee6aa7071bb',
        meta: {
          transformed: {
            text: 'localized',
          },
          localizedTextInputs: ['text'],
          bindingActions: {
            _newProperty: null,
          },
        },
        component: {
          name: 'Text',
          options: {
            text: {
              '@type': '@builder.io/core:LocalizedValue',
              Default: 'Enter some text...',
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
            marginTop: '20px',
            lineHeight: 'normal',
            height: 'auto',
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
  lastUpdated: 1733999285539,
  testRatio: 1,
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};
