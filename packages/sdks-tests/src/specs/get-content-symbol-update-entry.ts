export const GET_CONTENT_SYMBOL_UPDATE_ENTRY_ONE = {
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-d3b5d8a50eff41e7a24cce1b82abd8fe',
        component: { name: 'Text', options: { text: 'Green Potato' } },
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

export const MAIN_CONTENT = {
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
    ],
  },
};

export const GET_CONTENT_SYMBOL_UPDATE_ENTRY__TWO = {
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-fb1550e198b84b6089fdc977a393f208',
        component: { name: 'Text', options: { text: 'Red tomato' } },
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
