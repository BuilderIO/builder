export const TRACK_CONVERSION = {
  data: {
    title: 'Track Conversion Test',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        actions: { click: 'builder.trackConversion(10)' },
        id: 'builder-track-conversion-button',
        meta: {
          eventActions: {
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:customCode',
                options: {
                  code: 'builder.trackConversion(10)',
                },
              },
            ],
          },
        },
        component: {
          name: 'Core:Button',
          options: { text: 'Track Conversion', openLinkInNewTab: false },
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
        actions: { click: 'builder.trackConversion(25, { customField: "test-value" })' },
        id: 'builder-track-conversion-with-props-button',
        meta: {
          eventActions: {
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:customCode',
                options: {
                  code: 'builder.trackConversion(25, { customField: "test-value" })',
                },
              },
            ],
          },
        },
        component: {
          name: 'Core:Button',
          options: { text: 'Track Conversion With Props', openLinkInNewTab: false },
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
            backgroundColor: 'blue',
            color: 'white',
            borderRadius: '4px',
            textAlign: 'center',
            cursor: 'pointer',
          },
        },
      },
    ],
    inputs: [],
  },
  id: 'track-conversion-test-content-id',
  name: 'track-conversion-test',
  testVariationId: 'track-conversion-variation-id',
};
