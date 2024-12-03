// routes/advanced-child.tsx
import { Builder, BuilderComponent, builder } from '@builder.io/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { CustomColumns } from './components/CustomColumns';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

Builder.registerComponent(CustomColumns, {
  name: 'MyColumns',
  inputs: [
    {
      name: 'column1',
      type: 'uiBlocks',
      defaultValue: [],
    },
    {
      name: 'column2',
      type: 'uiBlocks',
      defaultValue: [],
    },
  ],
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const page = await builder
    .get('editable-regions', {
      userAttributes: {
        urlPath: `/${request.url.split('/').pop()}`,
      },
    })
    .toPromise();

  console.log('page', page);
  return { page };
};

export default function EditableRegionsPage() {
  const { page } = useLoaderData<typeof loader>();

  console.log('page', page);

  return <BuilderComponent model="editable-regions" content={page} />;
}
