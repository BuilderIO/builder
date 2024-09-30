/**
 * Quickstart snippet
 * snippets/gen1-remix/app/routes/_index.tsx
 */
import { BuilderComponent, builder } from '@builder.io/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  console.log('params', params);
  const page = await builder
    .get('page', {
      userAttributes: {
        urlPath: `/${params.slug ? params.slug : ''}`,
      },
    })
    .promise();

  const isPreviewing = new URL(request.url).searchParams.has('builder.preview');

  if (!page && !isPreviewing) {
    throw new Response('Page Not Found', {
      status: 404,
      statusText:
        "We couldn't find this page, please check your url path and if the page is published on Builder.io.",
    });
  }

  return { page };
};

export default function Page() {
  const { page } = useLoaderData<typeof loader>();

  return <BuilderComponent model="page" content={page} />;
}
