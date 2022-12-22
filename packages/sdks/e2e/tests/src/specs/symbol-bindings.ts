export const CONTENT = {
  variations: {},
  id: '0d2c62b4818a4ef980d3c2bc3a652488',
  published: 'draft',
  data: {
    themeId: false,
    title: 'symbol-style-bindings',
    inputs: [],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        layerName: 'symbol-with-style-bindings',
        id: 'builder-0a8fe44ea6a243d3b26e97f5c4d3c588',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              data: {
                borderRadiusTopLeft: '10px',
                borderRadiusTopRight: '220px',
                borderRadiusBottomLeft: '30px',
                borderRadiusBottomRight: '40px',
              },
              model: 'symbol',
              entry: 'f79d0ad6c4b7445394805e792e476356',
              content: {
                createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
                meta: {
                  kind: 'component',
                  hasLinks: false,
                  lastPreviewUrl:
                    'https://preview.builder.codes?model=symbol&previewing=true&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=symbol&builder.noCache=true&__builder_editing__=true&builder.overrides.symbol=f79d0ad6c4b7445394805e792e476356&builder.overrides.f79d0ad6c4b7445394805e792e476356=f79d0ad6c4b7445394805e792e476356',
                  needsHydration: false,
                },
                variations: {},
                folders: [],
                firstPublished: 1671671895643,
                testRatio: 1,
                lastUpdated: 1671671895644,
                query: [],
                modelId: 'd661dd1d06ce43ddbe3c2fe35597e545',
                createdDate: 1671671751117,
                id: 'f79d0ad6c4b7445394805e792e476356',
                name: 'symbol-with-style-bindings',
                lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
                data: {
                  inputs: [
                    {
                      copyOnAdd: true,
                      hideFromUI: false,
                      disallowRemove: false,
                      name: 'borderRadiusTopLeft',
                      showTemplatePicker: true,
                      bubble: false,
                      showIf: '',
                      noPhotoPicker: false,
                      subFields: [],
                      '@type': '@builder.io/core:Field',
                      broadcast: false,
                      onChange: '',
                      hideFromFieldsEditor: false,
                      required: true,
                      advanced: false,
                      helperText: '',
                      defaultValue: '20px',
                      type: 'text',
                      model: '',
                      hidden: false,
                      mandatory: false,
                      simpleTextOnly: false,
                      permissionsRequiredToEdit: '',
                      autoFocus: false,
                    },
                    {
                      disallowRemove: false,
                      hideFromFieldsEditor: false,
                      showIf: '',
                      simpleTextOnly: false,
                      required: false,
                      permissionsRequiredToEdit: '',
                      subFields: [],
                      bubble: false,
                      name: 'borderRadiusTopRight',
                      autoFocus: false,
                      hidden: false,
                      mandatory: false,
                      helperText: '',
                      hideFromUI: false,
                      advanced: false,
                      model: '',
                      broadcast: false,
                      type: 'text',
                      noPhotoPicker: false,
                      onChange: '',
                      showTemplatePicker: true,
                      '@type': '@builder.io/core:Field',
                      defaultValue: '20px',
                      copyOnAdd: true,
                    },
                    {
                      broadcast: false,
                      mandatory: false,
                      copyOnAdd: true,
                      bubble: false,
                      '@type': '@builder.io/core:Field',
                      onChange: '',
                      defaultValue: '20px',
                      hideFromUI: false,
                      required: false,
                      hideFromFieldsEditor: false,
                      showTemplatePicker: true,
                      simpleTextOnly: false,
                      helperText: '',
                      name: 'borderRadiusBottomLeft',
                      subFields: [],
                      model: '',
                      showIf: '',
                      permissionsRequiredToEdit: '',
                      disallowRemove: false,
                      hidden: false,
                      type: 'text',
                      autoFocus: false,
                      noPhotoPicker: false,
                      advanced: false,
                    },
                    {
                      copyOnAdd: true,
                      simpleTextOnly: false,
                      showIf: '',
                      hidden: false,
                      broadcast: false,
                      name: 'borderRadiusBottomRight',
                      permissionsRequiredToEdit: '',
                      defaultValue: '20px',
                      mandatory: false,
                      type: 'text',
                      helperText: '',
                      noPhotoPicker: false,
                      hideFromUI: false,
                      disallowRemove: false,
                      hideFromFieldsEditor: false,
                      advanced: false,
                      onChange: '',
                      subFields: [],
                      autoFocus: false,
                      showTemplatePicker: true,
                      model: '',
                      '@type': '@builder.io/core:Field',
                      required: false,
                      bubble: false,
                    },
                  ],
                  blocks: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      tagName: 'h1',
                      bindings: {
                        'style.borderTopLeftRadius':
                          'var _virtual_index=state.borderRadiusTopLeft;return _virtual_index',
                        'style.borderTopRightRadius':
                          'var _virtual_index=state.borderRadiusTopRight;return _virtual_index',
                        'style.borderBottomLeftRadius':
                          'var _virtual_index=state.borderRadiusBottomLeft;return _virtual_index',
                        'style.borderBottomRightRadius':
                          'var _virtual_index=state.borderRadiusBottomRight;return _virtual_index',
                      },
                      id: 'builder-09c6859ec12241b99153a8383954fcfd',
                      responsiveStyles: {
                        large: {
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          flexShrink: '0',
                          boxSizing: 'border-box',
                          marginTop: '20px',
                          height: '200px',
                          backgroundColor: 'rgba(89, 43, 43, 1)',
                        },
                      },
                    },
                    {
                      id: 'builder-pixel-0diydmy0hbrd',
                      '@type': '@builder.io/sdk:Element',
                      tagName: 'img',
                      properties: {
                        src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
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
                  state: {
                    deviceSize: 'large',
                    location: { path: '', query: {} },
                  },
                },
                published: 'published',
                rev: 'pv71zw058t',
              },
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
    url: '/symbol-style-bindings',
    state: { deviceSize: 'large', location: { path: '', query: {} } },
  },
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  query: [
    {
      operator: 'is',
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/symbol-style-bindings',
    },
  ],
  createdDate: 1671676157984,
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'http://localhost:5173/?model=page&previewing=true&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=0d2c62b4818a4ef980d3c2bc3a652488&builder.overrides.0d2c62b4818a4ef980d3c2bc3a652488=0d2c62b4818a4ef980d3c2bc3a652488&builder.overrides.page:/=0d2c62b4818a4ef980d3c2bc3a652488',
    hasLinks: false,
    needsHydration: false,
  },
  testRatio: 1,
  name: 'symbol-style-bindings',
  modelId: '240a12053d674735ac2a384dcdc561b5',
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  lastUpdated: 1671676282736,
  folders: [],
  rev: '413qgn3b9so',
};
