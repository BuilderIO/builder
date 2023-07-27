export const CONTENT = {
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  folders: [],
  data: {
    title: 'A/B test route',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-f97db18e1c324b38b52526cc02cfc5fc',
        component: {
          name: 'Text',
          options: {
            text: '<span style="display: block;" class="builder-paragraph">This is the default variation!</span>',
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
            borderStyle: 'solid',
            borderWidth: '1px',
          },
        },
      },
      {
        id: 'builder-pixel-0cveufoc1pmh',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660&contentId=691abdd7105c4cf7b9609995fc1fb56c&url=%2Fab-test',
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
    url: '/ab-test',
    state: {
      deviceSize: 'large',
      location: {
        pathname: '/ab-test',
        path: ['ab-test'],
        query: {},
      },
    },
  },
  modelId: '240a12053d674735ac2a384dcdc561b5',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/ab-test',
      operator: 'is',
    },
  ],
  published: 'published',
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F393c39dc0c3440a3a4880e51e11bf8f9',
  firstPublished: 1663366991657,
  testRatio: 0.3334,
  lastUpdated: 1689179467459,
  createdDate: 1651006982202,
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'https://svelte-vite-example.vercel.app/ab-test?builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=691abdd7105c4cf7b9609995fc1fb56c&builder.overrides.691abdd7105c4cf7b9609995fc1fb56c=691abdd7105c4cf7b9609995fc1fb56c&builder.overrides.page:/ab-test=691abdd7105c4cf7b9609995fc1fb56c&builder.options.locale=Default',
    hasLinks: false,
  },
  variations: {
    d7b7153da32c4d219b9b5c63ec129c94: {
      testRatio: 0.3333,
      createdDate: 1651013293898,
      data: {
        title: 'A/B test route',
        blocks: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-389a594170d846e995ced05decdfbd59',
            component: {
              name: 'Text',
              options: {
                text: '<span style="display: block;" class="builder-paragraph">text only in variation 2</span>',
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
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(74, 144, 226, 1)',
              },
            },
          },
        ],
      },
      meta: {},
      name: 'Variation 22',
      id: 'd7b7153da32c4d219b9b5c63ec129c94',
    },
    '661775df8c2c41d6afc0aa1b5fd1dd61': {
      testRatio: 0.3333,
      createdDate: 1651007142663,
      data: {
        title: 'A/B test route',
        blocks: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-c4f6b6e549bc489486f2388c59bc4205',
            component: {
              name: 'Text',
              options: {
                text: '<span style="display: block;" class="builder-paragraph">This is variation 1</span>',
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
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(208, 2, 27, 1)',
              },
            },
          },
        ],
      },
      meta: {},
      name: 'Variation 1',
      id: '661775df8c2c41d6afc0aa1b5fd1dd61',
    },
  },
  name: 'A/B test route',
  id: '691abdd7105c4cf7b9609995fc1fb56c',
  rev: 'ieaz0k1367l',
};
