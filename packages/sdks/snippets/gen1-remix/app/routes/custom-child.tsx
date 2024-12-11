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

// IMPORTANT: withChildren is required to enable child block functionality
const CustomHeroWithChildren = withChildren(CustomHero);

// Register the component with children
Builder.registerComponent(CustomHeroWithChildren, {
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
