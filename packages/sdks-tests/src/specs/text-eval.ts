export const CONTENT = {
  id: '6212bd298e3248dab74048c6a10f84ec',
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  lastUpdated: 1674570277771,
  name: 'reactive-state',
  meta: {
    lastPreviewUrl:
      'https://preview.builder.codes?model=page&previewing=true&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=6212bd298e3248dab74048c6a10f84ec&builder.overrides.6212bd298e3248dab74048c6a10f84ec=6212bd298e3248dab74048c6a10f84ec&builder.overrides.page:/=6212bd298e3248dab74048c6a10f84ec',
    kind: 'page',
    hasLinks: false,
    needsHydration: true,
  },
  firstPublished: 1674570277770,
  published: 'published',
  query: [
    {
      property: 'urlPath',
      operator: 'is',
      '@type': '@builder.io/core:Query',
      value: '/text-eval',
    },
  ],
  testRatio: 1,
  createdDate: 1674570061694,
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  modelId: '240a12053d674735ac2a384dcdc561b5',
  folders: [],
  variations: {},
  data: {
    themeId: false,
    title: 'text-eval',
    inputs: [],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-fea3981e1a654e69be0e1a0e2a8fc7b5',
        component: {
          name: 'Columns',
          options: {
            columns: [
              {
                blocks: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-57deea4873664c119e77a876d636c987',
                    meta: {
                      previousId: 'builder-ca1f2ca48bc34e669359dd5b4ec3cbc3',
                    },
                    component: {
                      name: 'Text',
                      options: {
                        text: 'Device Size: {{state.deviceSize}}',
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
            space: 20,
            stackColumnsAt: 'tablet',
            reverseColumnsWhenStacked: false,
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
      {
        id: 'builder-pixel-6yc5qr11gcq',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
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
    url: '/text-eval',
    state: {
      deviceSize: 'large',
      location: {
        pathname: '/text-eval',
        path: ['text-eval'],
        query: {},
      },
    },
  },
  rev: 'jyaeg1yd0lj',
};
