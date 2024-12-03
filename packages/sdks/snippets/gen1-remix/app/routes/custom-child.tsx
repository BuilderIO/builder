import {
  Builder,
  builder,
  BuilderComponent,
  withChildren,
} from '@builder.io/react';

import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { CustomHero } from './components/CustomHero';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

Builder.registerComponent(withChildren(CustomHero), {
  name: 'CustomHero',
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
  const url = new URL(request.url);

  const page = await builder
    .get('custom-child', {
      userAttributes: {
        urlPath: url.pathname,
      },
    })
    .toPromise();
  return { page };
};

export default function CustomChildPage() {
  const { page } = useLoaderData<typeof loader>();

  return <BuilderComponent model="custom-child" content={page} />;
}
