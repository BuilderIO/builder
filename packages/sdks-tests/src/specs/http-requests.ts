export const HTTP_REQUESTS = {
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  createdDate: 1644861373771,
  data: {
    inputs: [],
    title: 'Home',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          'component.options.text':
            'var _virtual_index=state.article.entries[0].seo_title;return _virtual_index',
        },
        code: {
          bindings: {
            'component.options.text': 'state.article.entries[0].seo_title',
          },
        },
        id: 'builder-ae1475bc1a1941ce839d210f20b96192',
        component: {
          name: 'Text',
          options: { text: 'Enter some text...' },
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
    url: '/',
    httpRequests: {
      article:
        'https://cdn.builder.io/api/v1/proxy-api?url=https%3A%2F%2Fcdn.contentstack.io%2Fv3%2Fcontent_types%2Farticle%2Fentries%3Fenvironment%3Dprod&headers.api_key=bltc12136c3b9f23503&headers.access_token=cs4291c43a722a771559bd3b3d',
    },
    state: {
      deviceSize: 'large',
      location: { pathname: '/', path: [''], query: {} },
    },
  },
  id: '037948e52eaf4743afed464f02c70da4',
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  modelId: '240a12053d674735ac2a384dcdc561b5',
  name: 'Home',
  published: 'published',
  query: [
    {
      '@type': '@builder.io/core:Query',
      operator: 'is',
      property: 'urlPath',
      value: '/',
    },
  ],
  testRatio: 1,
  variations: {},
  lastUpdated: 1658242555536,
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F34622bca1dd941968b25341a40be51f7',
  firstPublished: 1644861541599,
  rev: 'ooerksctkc',
};
