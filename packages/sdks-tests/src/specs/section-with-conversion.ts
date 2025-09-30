import type { BuilderContent } from './types.js';

export const CONVERSION_SECTION_CONTENT: BuilderContent = {
  id: 'section-conversion-test-id',
  data: {
    title: 'Section Conversion Test',
    inputs: [],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-cb4f82738ca74cfea35bf6b4e17aeb4b',
        component: {
          name: 'Core:Section',
          options: {
            maxWidth: 1200,
            lazyLoad: false,
          },
          isRSC: null,
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            actions: {
              click: 'builder.trackConversion()',
            },
            code: {
              actions: {
                click: 'builder.trackConversion();\n',
              },
            },
            id: 'builder-e5427a3b502d40c3a29de1e626fd1618',
            meta: {
              eventActions: {
                '': [],
                click: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:trackEvent',
                    options: {
                      name: 'myEvent',
                      trackConversion: true,
                    },
                  },
                ],
              },
            },
            component: {
              name: 'Core:Button',
              options: {
                text: 'Section Button',
                openLinkInNewTab: false,
              },
              isRSC: null,
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
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '0px',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '20px',
            paddingBottom: '20px',
            minHeight: '100px',
          },
        },
      },
    ],
  },
  meta: {
    hasLinks: false,
    kind: 'page',
  },
};

export const CONTENT_WITH_SECTION_MODEL = {
  id: 'test-content-id',
  data: {
    title: 'Section Conversion Test',
    inputs: [],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-text-header',
        component: {
          name: 'Text',
          options: {
            text: '<h1>Section Conversion Tracking Test</h1>',
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
            textAlign: 'center',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-f2a4c0079d5149c3bc23e3c3032f88df',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              model: 'sample-section-model',
              entry: 'section-conversion-test-id',
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
          },
        },
      },
    ],
  },
  meta: {
    hasLinks: false,
    kind: 'page',
  },
};
