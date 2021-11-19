import { BuilderContent } from '@builder.io/sdk';
import { transformComponents } from './transform-components';

test('Migrate component props', async () => {
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          '@type': '@builder.io/sdk:Element',
          component: {
            name: 'Products',
            options: {
              category: 'women',
            },
          },
        },
      ],
    },
  };
  const result = transformComponents(content, {
    Products: {
      name: 'ProductsV2',
      props: {
        collection: 'category',
      },
    },
  });
  console.log(result.data!);
  expect(result.data!.blocks![0].component!.options.collection).toBe('women');
  expect(result.data!.blocks![0].component!.name).toBe('ProductsV2');
});
