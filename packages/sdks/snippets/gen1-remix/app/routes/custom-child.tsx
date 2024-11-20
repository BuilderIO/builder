import { Builder, builder, BuilderComponent } from '@builder.io/react';

import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { CustomHero } from './components/CustomHero';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

Builder.registerComponent(CustomHero, {
  name: 'CustomHero',
  inputs: [],
  canHaveChildren: true,
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      component: {
        name: 'Text',
        options: {
          text: 'This is Builder text',
        },
      },
    },
  ],
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const page = await builder
    .get('custom-child', {
      userAttributes: {
        urlPath: `/${request.url.split('/').pop()}`,
      },
    })
    .toPromise();

  return { page };
};

export default function CustomChildPage() {
  const { page } = useLoaderData<typeof loader>();

  return <BuilderComponent model="custom-child" content={page} />;
}
