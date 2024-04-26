export const TABS = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1713420740294,
  id: 'ca17bed095244492bc1944916f8547c2',
  '@version': 4,
  name: 'tabs',
  modelId: '17c6065109ef4062ba083f5741f4ee6a',
  published: 'published',
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'http://localhost:3000/tabs?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=ca17bed095244492bc1944916f8547c2&builder.overrides.ca17bed095244492bc1944916f8547c2=ca17bed095244492bc1944916f8547c2&builder.overrides.page:/tabs=ca17bed095244492bc1944916f8547c2&builder.options.locale=Default',
    hasLinks: false,
  },
  priority: -426,
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/tabs',
    },
  ],
  data: {
    subtitle: {
      '@type': '@builder.io/core:LocalizedValue',
    },
    themeId: false,
    title: 'tabs',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-008c8cf30df44c9c8f05e969f3f394d3',
        component: {
          name: 'Builder: Tabs',
          options: {
            tabs: [
              {
                label: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-0b843f887a564aa887ca14627707719c',
                    component: {
                      name: 'Text',
                      options: {
                        text: 'Tab 1',
                      },
                    },
                    responsiveStyles: {
                      large: {
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        minWidth: '100px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        userSelect: 'none',
                      },
                    },
                  },
                ],
                content: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-4e48532006d7498a99237e694f8a393f',
                    component: {
                      name: 'Text',
                      options: {
                        text: 'inside tab 1',
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
                      },
                    },
                  },
                ],
              },
              {
                label: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-7e4486cad831473c9246b335dbcfe7ce',
                    component: {
                      name: 'Text',
                      options: {
                        text: 'Tab 2',
                      },
                    },
                    responsiveStyles: {
                      large: {
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        minWidth: '100px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        userSelect: 'none',
                      },
                    },
                  },
                ],
                content: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-b4abe21bbbd4478096688a5e66e770b9',
                    component: {
                      name: 'Text',
                      options: {
                        text: '<span style="font-family: sans-serif; font-size: medium; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">inside tab 2</span>',
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
                      },
                    },
                  },
                ],
              },
              {
                label: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-8129a1d9ec0f470d81f6117ff34a929b',
                    component: {
                      name: 'Text',
                      options: {
                        text: 'Tab 3',
                      },
                    },
                    responsiveStyles: {
                      large: {
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        minWidth: '100px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        userSelect: 'none',
                      },
                    },
                  },
                ],
                content: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-1d177d01b11b4832abba6ea5c553feab',
                    component: {
                      name: 'Text',
                      options: {
                        text: '<span style="font-family: sans-serif; font-size: medium; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;">inside tab 3<br></span>',
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
                      },
                    },
                  },
                ],
              },
            ],
            activeTabStyle: {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            },
            defaultActiveTab: 1,
            collapsible: false,
            tabHeaderLayout: 'flex-start',
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
  metrics: {
    clicks: 0,
    impressions: 0,
  },
  variations: {},
  lastUpdated: 1713420943266,
  firstPublished: 1713420943245,
  testRatio: 1,
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Fad30f9a246614faaa6a03374f83554c9%2F17749dcb6dd244448584d800f9f6900c',
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};
