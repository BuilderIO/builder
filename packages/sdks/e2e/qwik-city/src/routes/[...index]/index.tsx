import { component$ } from '@builder.io/qwik';
import { RenderContent } from '../../sdk-src';

export const CONTENT_WITHOUT_SYMBOLS = {
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  createdDate: 1647464399394,
  data: {
    inputs: [],
    title: 'Symbols',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        layerName: 'photo card symbol',
        id: 'builder-9f3d979aacac4320a8a86f86a387b4fc',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              data: {
                description: 'special test description',
                image:
                  'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F4bce19c3d8f040b3a95e91000a98283e',
              },
              model: 'symbol',
              entry: '29ab534d62c4406c8500e1cbfa609537',
            },
          },
        },
      },
    ],
    url: '/symbols',
    state: {
      deviceSize: 'large',
      location: { pathname: '/symbols', path: ['symbols'], query: {} },
    },
  },
  id: '2a23baae19a64031b8dd17e8fd8adc47',
  modelId: '240a12053d674735ac2a384dcdc561b5',
  name: 'Symbols',
  published: 'published',
};
export interface MainProps {
  url: string;
}
export default component$(() => {
  return <RenderContent content={CONTENT_WITHOUT_SYMBOLS} apiKey="abcd" />;
});
