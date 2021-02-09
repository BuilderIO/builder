import { BuilderContent } from '@builder.io/sdk';
import { getAsyncProps } from './get-async-props';

test('Adds async props', async () => {
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
  await getAsyncProps(content, {
    async Products(props) {
      return {
        data: props.category,
      };
    },
  });
  expect(content.data!.blocks![0].component!.options.data).toBe('women');
});
