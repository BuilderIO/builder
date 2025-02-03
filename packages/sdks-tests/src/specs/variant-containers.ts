export const VARIANT_CONTAINERS = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1736762892655,
  id: 'b8067a39a55a4c31ac09ca56dff8988d',
  '@version': 4,
  name: 'variant-containers',
  modelId: '17c6065109ef4062ba083f5741f4ee6a',
  published: 'published',
  meta: {
    hasLinks: false,
    kind: 'page',
    componentsUsed: {
      PersonalizationContainer: 1,
    },
    lastPreviewUrl:
      'http://localhost:3000/variant-containers?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers%2CeditContentPriority&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=b8067a39a55a4c31ac09ca56dff8988d&builder.overrides.b8067a39a55a4c31ac09ca56dff8988d=b8067a39a55a4c31ac09ca56dff8988d&builder.overrides.page:/variant-containers=b8067a39a55a4c31ac09ca56dff8988d&builder.options.locale=Default',
  },
  priority: -935,
  stage: 'b3ee01559a244a078973f545ad475eba',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/variant-containers',
    },
  ],
  data: {
    themeId: false,
    title: 'variant-containers',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-f90383ccd64745ada9399da4f492b466',
        component: {
          name: 'PersonalizationContainer',
          options: {
            variants: [
              {
                blocks: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-80fc5f0d3cf04d44aaa7d241cd382dc5',
                    component: {
                      name: 'Text',
                      options: {
                        text: 'My tablet content',
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
                query: [
                  {
                    '@type': '@builder.io/core:Query',
                    property: 'device',
                    operator: 'is',
                    value: ['tablet'],
                  },
                ],
                name: 'tablet variant',
              },
              {
                blocks: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-068f68721a984ee48c0a17b525722702',
                    component: {
                      name: 'Text',
                      options: {
                        text: 'My mobile content updated',
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
                query: [
                  {
                    '@type': '@builder.io/core:Query',
                    property: 'device',
                    operator: 'is',
                    value: ['mobile'],
                  },
                ],
                name: 'mobile variant',
              },
            ],
            previewingIndex: 0,
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-0ebe0aeb60414c5cad19ba33e85f3f4b',
            component: {
              name: 'Text',
              options: {
                text: 'My default content',
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
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-f90383ccd64745ada9399da4f492b466',
        component: {
          name: 'PersonalizationContainer',
          options: {
            variants: [
              {
                blocks: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-80fc5f0d3cf04d44aaa7d241cd382dc5',
                    component: {
                      name: 'Text',
                      options: {
                        text: 'Tablet content 2',
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
                query: [],
                name: 'tablet variant',
              },
            ],
            previewingIndex: 0,
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-0ebe0aeb60414c5cad19ba33e85f3f4b',
            component: {
              name: 'Text',
              options: {
                text: 'Default content 2',
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
        responsiveStyles: {
          large: {
            backgroundColor: 'red',
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
  lastUpdated: 1737383854295,
  firstPublished: 1736763147993,
  testRatio: 1,
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};

export const VARIANT_CONTAINERS_WITH_PREVIEWING_INDEX_1 = {
  ...VARIANT_CONTAINERS,
  data: {
    ...VARIANT_CONTAINERS.data,
    blocks: VARIANT_CONTAINERS.data.blocks.map(block => ({
      ...block,
      component: {
        ...block.component,
        options: { ...block.component.options, previewingIndex: 1 },
      },
    })),
  },
};

export const VARIANT_CONTAINERS_WITH_PREVIEWING_INDEX_UNDEFINED = {
  ...VARIANT_CONTAINERS,
  data: {
    ...VARIANT_CONTAINERS.data,
    blocks: VARIANT_CONTAINERS.data.blocks.map(block => ({
      ...block,
      component: {
        ...block.component,
        options: { ...block.component.options, previewingIndex: null },
      },
    })),
  },
};
