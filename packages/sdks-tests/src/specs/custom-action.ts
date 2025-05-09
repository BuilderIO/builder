export const CUSTOM_ACTION = {
  data: {
    title: 'Builder + React Demo Page',
    httpRequests: {},
    customFonts: [
      {
        variants: [
          '100',
          '100italic',
          '200',
          '200italic',
          '300',
          '300italic',
          'regular',
          'italic',
          '500',
          '500italic',
          '600',
          '600italic',
          '700',
          '700italic',
          '800',
          '800italic',
          '900',
          '900italic',
        ],
        lastModified: '2022-09-22',
        family: 'Poppins',
        version: 'v20',
        category: 'sans-serif',
        menu: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJHedw.ttf',
        subsets: ['devanagari', 'latin', 'latin-ext'],
        kind: 'webfonts#webfont',
        files: {
          '100': 'https://fonts.gstatic.com/s/poppins/v20/pxiGyp8kv8JHgFVrLPTed3FBGPaTSQ.ttf',
          '200': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLFj_V1tvFP-KUEg.ttf',
          '300': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDz8V1tvFP-KUEg.ttf',
          '500': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLGT9V1tvFP-KUEg.ttf',
          '600': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6V1tvFP-KUEg.ttf',
          '700': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7V1tvFP-KUEg.ttf',
          '800': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDD4V1tvFP-KUEg.ttf',
          '900': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLBT5V1tvFP-KUEg.ttf',
          regular: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJDUc1NECPY.ttf',
          '800italic':
            'https://fonts.gstatic.com/s/poppins/v20/pxiDyp8kv8JHgFVrJJLm111lEN2PQEhcqw.ttf',
          italic: 'https://fonts.gstatic.com/s/poppins/v20/pxiGyp8kv8JHgFVrJJLed3FBGPaTSQ.ttf',
          '700italic':
            'https://fonts.gstatic.com/s/poppins/v20/pxiDyp8kv8JHgFVrJJLmy15lEN2PQEhcqw.ttf',
          '300italic':
            'https://fonts.gstatic.com/s/poppins/v20/pxiDyp8kv8JHgFVrJJLm21llEN2PQEhcqw.ttf',
          '100italic':
            'https://fonts.gstatic.com/s/poppins/v20/pxiAyp8kv8JHgFVrJJLmE3tFOvODSVFF.ttf',
          '600italic':
            'https://fonts.gstatic.com/s/poppins/v20/pxiDyp8kv8JHgFVrJJLmr19lEN2PQEhcqw.ttf',
          '900italic':
            'https://fonts.gstatic.com/s/poppins/v20/pxiDyp8kv8JHgFVrJJLm81xlEN2PQEhcqw.ttf',
          '500italic':
            'https://fonts.gstatic.com/s/poppins/v20/pxiDyp8kv8JHgFVrJJLmg1hlEN2PQEhcqw.ttf',
          '200italic':
            'https://fonts.gstatic.com/s/poppins/v20/pxiDyp8kv8JHgFVrJJLmv1plEN2PQEhcqw.ttf',
        },
      },
    ],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        code: { actions: { click: 'console.log("Action");\n' } },
        id: 'builder-92f94a8f948e4b94ad04efe43c61c46d',
        meta: {
          eventActions: {
            '': [],
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: 'test-action-id',
                options: { actionName: 'action-name' },
              },
            ],
          },
        },
        component: {
          name: 'Core:Button',
          options: { text: 'click', openLinkInNewTab: false },
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
    inputs: [],
  },
};
