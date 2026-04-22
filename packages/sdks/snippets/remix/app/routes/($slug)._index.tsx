// ($slug)._index.tsx
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'page';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const urlPath = `/${params['slug'] || ''}`;

  const page = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: BUILDER_API_KEY,
    userAttributes: { urlPath },
  });

  if (!page && !isPreviewing(url.search)) {
    throw new Response('Page Not Found', {
      status: 404,
      statusText: 'Page not found in Builder.io',
    });
  }

  return { page };
};

// Define and render the page.
export default function Page() {
  // Use the useLoaderData hook to get the Page data from `loader` above.
  const { page } = useLoaderData<typeof loader>();

  // Render the page content from Builder.io
  return <Content model={MODEL_NAME} apiKey={BUILDER_API_KEY} content={page} />;
}
