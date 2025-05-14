export const HTTP_REQUESTS_POST_API_CONTENT = {
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
          'component.options.text': 'state.countriesItem.name',
        },
        code: {
          bindings: {
            'component.options.text': 'state.countriesItem.name',
          },
        },
        repeat: {
          collection: 'state.someOtherRequest.data.countries',
        },
        id: 'builder-7e214686e245495aa8a4b67fc13bc746',
        meta: {
          bindingActions: {
            _newProperty: null,
            component: {
              options: {
                text: null,
              },
            },
          },
        },
        component: {
          name: 'Text',
          options: {
            text: 'Enter some text...',
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
    url: '/',
    httpRequests: {
      someOtherRequest: {
        '@type': '@builder.io/core:Request',
        request: {
          url: 'https://cdn.builder.io/api/v2/admin',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `query ExampleQuery {
              countries {
                name
              }
            }`,
            variables: {},
          }),
        },
      },
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
