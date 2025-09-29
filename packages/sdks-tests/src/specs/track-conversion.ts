export const TRACK_CONVERSION_CONTENT = {
  published: 'published',
  lastUpdatedBy: 'otrVluNzvNScbfBcM1pwuzPvX1o1',
  modelId: '8b9bea507dd04be3a23d84c5d3824a48',
  data: {
    themeId: false,
    inputs: [],
    title: '[TEST] Insights Test',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-5e19c8bf75d243f2807ed6194bb1cfb3',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            actions: {
              click: 'builder.trackConversion(100);\n',
            },
            code: {
              actions: {
                click: 'builder.trackConversion(100);\n',
              },
            },
            id: 'builder-92b45ec0dbab4c4ba6fbe6d9f2557bff',
            meta: {
              eventActions: {
                click: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:trackEvent',
                    options: {
                      name: 'myEvent',
                      amount: 100,
                      trackConversion: true,
                    },
                  },
                ],
              },
            },
            component: {
              name: 'Core:Button',
              options: {
                text: 'Track Basic Conversion',
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
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-eaeaec2f9fcd435993dbf28ba5060c6c',
            component: {
              name: 'Text',
              options: {
                text: '<h1><strong>Default Variant</strong></h1>',
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
                marginTop: '150px',
                lineHeight: 'normal',
                height: 'auto',
                marginBottom: '10px',
                paddingBottom: '0px',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            actions: {
              click: 'builder.trackConversion();\n',
            },
            code: {
              actions: {
                click: 'builder.trackConversion();\n',
              },
            },
            id: 'builder-3b4d00a8858c4ebc951bf0860543dc67',
            meta: {
              eventActions: {
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
                text: 'Track conversion without amount',
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
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            actions: {
              click: 'builder.trackConversion(100);\n',
            },
            code: {
              actions: {
                click: 'builder.trackConversion(100);\n',
              },
            },
            id: 'builder-3b4d00a8858c4ebc951bf0860543dc67',
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
                text: 'Track conversion with amount',
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
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            actions: {
              click:
                "builder.trackConversion(100, 'test-content-id', 'test-variation-id', { product: 'premium-shoes' }, { userId: 'user-123' });\n",
            },
            code: {
              actions: {
                click:
                  "builder.trackConversion(100, 'test-content-id', 'test-variation-id', { product: 'premium-shoes' }, { userId: 'user-123' });\n",
              },
            },
            id: 'builder-3b4d00a8858c4ebc951bf0860543dc67',
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
                text: 'Track Conversion with All Parameters',
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
            marginTop: '20px',
            height: 'auto',
            paddingBottom: '0px',
            marginRight: '0px',
            justifyContent: 'center',
            width: 'auto',
            alignSelf: 'center',
            flexGrow: '0',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-section-with-conversion-test',
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
            id: 'builder-section-button-conversion',
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
                text: 'Section Button Conversion',
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
            marginTop: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '20px',
            paddingBottom: '20px',
            minHeight: '100px',
          },
        },
      },
      {
        id: 'builder-pixel-11upajbeli8i',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=75c6e293e39b4890ac75a37bbca0a447',
          'aria-hidden': 'true',
          alt: '',
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
    url: '/track-conversion',
    state: {
      deviceSize: 'large',
      location: {
        path: '',
        query: {},
      },
    },
  },
  createdBy: 'otrVluNzvNScbfBcM1pwuzPvX1o1',
  firstPublished: 1758694322547,
  meta: {
    hasLinks: false,
    kind: 'page',
  },
  testRatio: 0.5,
  folders: [],
  name: '[TEST] Insights Test',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/track-conversion',
      operator: 'is',
    },
  ],
  createdDate: 1758694019198,
  variations: {
    'test-variation-id': {
      createdDate: 1758694157902,
      testRatio: 0.5,
      meta: {},
      name: 'Variation 1',
      data: {
        title: '[TEST] Insights Test',
        inputs: [],
        themeId: false,
        blocks: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-7b0c38da24fa4cf98d6d1e6a5b277a58',
            meta: {
              previousId: 'builder-5e19c8bf75d243f2807ed6194bb1cfb3',
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                id: 'builder-e0dab9fa9dc6487baa20c9bb176417aa',
                meta: {
                  previousId: 'builder-eaeaec2f9fcd435993dbf28ba5060c6c',
                },
                component: {
                  name: 'Text',
                  options: {
                    text: '<h1><strong>Variation 1</strong></h1>',
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
                    marginTop: '150px',
                    lineHeight: 'normal',
                    height: 'auto',
                    marginBottom: '1px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                actions: {
                  click: 'builder.trackConversion(100);\n',
                },
                code: {
                  actions: {
                    click: 'builder.trackConversion(100);\n',
                  },
                },
                id: 'builder-92b45ec0dbab4c4ba6fbe6d9f2557bff',
                meta: {
                  eventActions: {
                    click: [
                      {
                        '@type': '@builder.io/core:Action',
                        action: '@builder.io:trackEvent',
                        options: {
                          name: 'myEvent',
                          amount: 100,
                          trackConversion: true,
                        },
                      },
                    ],
                  },
                },
                component: {
                  name: 'Core:Button',
                  options: {
                    text: 'Track Basic Conversion',
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
                marginTop: '20px',
                height: 'auto',
                paddingBottom: '0px',
                marginRight: '0px',
                justifyContent: 'center',
                width: 'auto',
                alignSelf: 'center',
                flexGrow: '0',
              },
            },
          },
        ],
      },
      id: 'test-variation-id',
    },
  },
  lastUpdated: 1758814072829,
  id: 'test-content-id',
  rev: 'lj38917wpgd',
};
