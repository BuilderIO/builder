export const EXTERNAL_DATA = {
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          'component.options.text':
            'var _virtual_index="Data value: ".concat(state.x);return _virtual_index',
        },
        code: {
          bindings: { 'component.options.text': '`Data value: ${state.x}`' },
        },
        id: 'builder-24c1f656a66f44d7a217cfb8eea159b4',
        component: {
          name: 'Text',
          options: { text: 'Enter some text...' },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'relative',
            marginTop: '20px',
            lineHeight: 'normal',
            height: 'auto',
          },
        },
      },
    ],
    inputs: [],
  },
};
