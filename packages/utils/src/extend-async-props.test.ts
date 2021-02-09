import { BuilderContent } from '@builder.io/sdk';
import { extendAsyncProps } from './extend-async-props';

async function getDataFromAPI(query: any) {
  return `searched for ${query.search}`;
}

test('Extends async props', async () => {
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
