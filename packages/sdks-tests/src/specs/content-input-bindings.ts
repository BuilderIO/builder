export const CONTENT = {
  data: {
    themeId: false,
    title: 'text-content-values-state-update',
    inputs: [
      {
        '@type': '@builder.io/core:Field',
        meta: {},
        name: 'booleanToggle',
        type: 'boolean',
        required: false,
        subFields: [],
        helperText: '',
        autoFocus: false,
        simpleTextOnly: false,
        disallowRemove: false,
        broadcast: false,
        bubble: false,
        hideFromUI: false,
        hideFromFieldsEditor: false,
        showTemplatePicker: true,
        permissionsRequiredToEdit: '',
        advanced: false,
        copyOnAdd: true,
        onChange: '',
        behavior: '',
        showIf: '',
        mandatory: false,
        hidden: false,
        noPhotoPicker: false,
        model: '',
        supportsAiGeneration: false,
        defaultCollapsed: false,
      },
    ],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-9ded3b30dfad47aaa8785a198538f8b3',
        meta: {
          bindingActions: {
            _newProperty: null,
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            bindings: {
              'component.options.text':
                'var _virtual_index=state.booleanToggle?"Hello":"Bye";return _virtual_index',
            },
            code: {
              bindings: {
                'component.options.text': "return state.booleanToggle ? 'Hello' : 'Bye'",
              },
            },
            layerName: 'Hello World',
            id: 'builder-79740126b0094b388a4c863d064b4185',
            meta: { bindingActions: { _newProperty: null } },
            component: { name: 'Text', options: { text: 'Enter some text...' } },
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
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            height: 'auto',
            paddingBottom: '30px',
          },
        },
      },
    ],
  },
};
