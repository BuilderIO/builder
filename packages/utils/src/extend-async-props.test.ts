import { BuilderContent } from '@builder.io/sdk';
import { extendAsyncProps } from './extend-async-props';

async function getDataFromAPI(query: any) {
  return `searched for ${query.search}`;
}

async function getProductByHandle(productHandle: string) {
  return {
    title: 'mock',
    handle: productHandle,
  };
}

test('Extends async props on custom components', async () => {
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          '@type': '@builder.io/sdk:Element',
          component: {
            name: 'Any',
            options: {
              myAutoPrefilledQuery: { sort: true, search: 'green shoes' },
            },
          },
        },
      ],
    },
  };
  await extendAsyncProps(content, {
    async myAutoPrefilledQuery(props) {
      const data = await getDataFromAPI(props.myAutoPrefilledQuery);
      return {
        data,
      };
    },
  });
  expect(content.data!.blocks![0].component!.options.data).toBe('searched for green shoes');
});

test('Extends async props on inlined symbols', async () => {
  const productHandle = '/test';
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          layerName: 'Product Box',
          component: {
            name: 'Symbol',
            options: {
              symbol: {
                data: {
                  loading: false,
                  productHandle: productHandle,
                },
              },
            },
          },
        },
      ],
    },
  };
  await extendAsyncProps(content, {
    async productHandle(props) {
      const product = await getProductByHandle(props.productHandle);
      return {
        initialState: {
          product,
        },
      };
    },
  });
  expect(content.data!.blocks![0].component!.options.symbol.data.initialState.product.handle).toBe(
    productHandle
  );
});
