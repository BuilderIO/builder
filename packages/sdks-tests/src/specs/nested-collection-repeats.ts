export const NESTED_COLLECTION_REPEATS = {
  data: {
    newField3: 'testing',
    themeId: false,
    title: 'nested-collections',
    inputs: [],
    state: {
      products: [
        { images: [{ url: 'foo' }, { url: 'bar' }] },
        { images: [{ url: 'baz' }, { url: 'qux' }] },
      ],
    },
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        repeat: { collection: 'state.products' },
        id: 'builder-c217b8cce9fa4d3490a8a1e06a7b978d',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            bindings: {
              'component.options.text':
                'var _virtual_index="url for product #".concat(state.$productsItemIndex,", image #").concat(state.$imagesItemIndex,": ").concat(state.imagesItem.url);return _virtual_index',
            },
            code: {
              bindings: {
                'component.options.text':
                  '`url for product #${state.$productsItemIndex}, image #${state.$imagesItemIndex}: ${state.imagesItem.url}`',
              },
            },
            repeat: { collection: 'state.productsItem.images' },
            id: 'builder-af30219ceb2345c6898574e48169b8dd',
            component: { name: 'Text', options: { text: 'Enter some text...' } },
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
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            height: 'auto',
            paddingBottom: '30px',
          },
        },
      },
    ],
  },
};
