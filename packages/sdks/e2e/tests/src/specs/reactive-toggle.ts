export const CONTENT = {
  query: [
    {
      property: 'urlPath',
      operator: 'is',
      value: '/reactive-toggle',
      '@type': '@builder.io/core:Query',
    },
  ],
  variations: {},
  folders: [],
  createdDate: 1675455127622,
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  data: {
    title: 'reactive-toggle',
    inputs: [
      {
        type: 'boolean',
        noPhotoPicker: false,
        simpleTextOnly: false,
        copyOnAdd: true,
        hidden: false,
        required: false,
        name: 'toggle',
        '@type': '@builder.io/core:Field',
        onChange: '',
        hideFromUI: false,
        hideFromFieldsEditor: false,
        showIf: '',
        mandatory: false,
        helperText: '',
        disallowRemove: false,
        permissionsRequiredToEdit: '',
        broadcast: false,
        subFields: [],
        bubble: false,
        autoFocus: false,
        model: '',
        advanced: false,
        showTemplatePicker: true,
      },
    ],
    themeId: false,
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          'component.options.text':
            'var _virtual_index=state.toggle?"hey":"nope";return _virtual_index',
        },
        id: 'builder-198daac971b642089fa300eb3b31fd5d',
        meta: {
          bindingActions: {
            component: {
              options: {
                text: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:conditionalValue',
                    options: {
                      expression: 'state.toggle',
                      then: 'hey',
                      else: 'nope',
                    },
                  },
                ],
              },
            },
          },
        },
        component: {
          name: 'Text',
          options: { text: 'Enter some text...' },
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
        actions: { click: 'state.toggle=!state.toggle' },
        id: 'builder-21150e42fa43456b9d66e157d6f46db8',
        meta: {
          eventActions: {
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:toggleState',
                options: { name: 'toggle' },
              },
            ],
          },
        },
        component: {
          name: 'Core:Button',
          options: { text: 'Click me!', openLinkInNewTab: false },
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
    url: '/reactive-toggle',
    state: { deviceSize: 'large', location: { path: '', query: {} } },
  },
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  meta: {
    lastPreviewUrl:
      'http://localhost:3000/?builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=7aae85475a0a4ed69140bc2ae7442bcf&builder.overrides.7aae85475a0a4ed69140bc2ae7442bcf=7aae85475a0a4ed69140bc2ae7442bcf&builder.overrides.page:/=7aae85475a0a4ed69140bc2ae7442bcf',
    hasLinks: false,
    kind: 'page',
    needsHydration: true,
  },
  published: 'draft',
  id: '7aae85475a0a4ed69140bc2ae7442bcf',
  name: 'reactive-toggle',
  lastUpdated: 1675457540049,
  modelId: '240a12053d674735ac2a384dcdc561b5',
  testRatio: 1,
  rev: 'eo7ba0rc70c',
};
