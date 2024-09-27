/**
 * Quickstart snippet
 * snippets/gen1-remix/app/routes/_index.tsx
 */
import { BuilderComponent, builder } from '@builder.io/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

// add your Public API Key here
builder.init('ee9f13b4981e489a9a1209887695ef2b');

// Fetch contents of the page
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // Fetch data content from Builder.io based on the URL path
  const page = await builder
    .get('page', {
      userAttributes: {
        urlPath: `/${params['*'] ? params['*'] : ''}`,
      },
    })
    .promise();

  // Verify the user is previewing or editing in Builder
  const isPreviewing = new URL(request.url).searchParams.has('builder.preview');

  // If the page is not found and the user is not previewing, throw a 404.
  // The CatchBoundary component will catch the error
  if (!page && !isPreviewing) {
    throw new Response('Page Not Found', {
      status: 404,
      statusText:
        "We couldn't find this page, please check your url path and if the page is published on Builder.io.",
    });
  }

  return { page };
};

// Define and render the page.
export default function Page() {
  // Use the useLoaderData hook to get the Page data from `loader` above.
  const { page } = useLoaderData<typeof loader>();

  // Render the page content from Builder.io
  return <BuilderComponent model="page" content={page} />;
}
