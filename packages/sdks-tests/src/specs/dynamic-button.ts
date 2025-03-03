export const DYNAMIC_BUTTON = {
  data: {
    title: 'dynamic-button-sdk-test',
    themeId: false,
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-b53d1cc2bcbb481b869207fdd97ee1db',
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
    ],
  },
};
