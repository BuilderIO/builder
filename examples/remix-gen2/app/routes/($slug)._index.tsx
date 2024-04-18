// ($slug)._index.tsx
import {
  fetchOneEntry,
  isEditing,
  isPreviewing,
  getBuilderSearchParams,
  Content,
} from "@builder.io/sdk-react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetch as webFetch } from "@remix-run/web-fetch";

const apiKey = "f1a790f8c3204b3b8c5c1795aeac4660"; // Replace with your actual API key

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const urlPath = `/${params["slug"] || ""}`;

  const { initializeNodeRuntime } = await import(
    "@builder.io/sdk-react/node/init"
  );
  await initializeNodeRuntime();

  const page = await fetchOneEntry({
    model: "page",
    apiKey: apiKey,
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: { urlPath },
    fetch: webFetch,
  });

  const isEditingOrPreviewing = isEditing() || isPreviewing();

  if (!page && !isEditingOrPreviewing) {
    throw new Response("Page Not Found", {
      status: 404,
      statusText: "Page not found in Builder.io",
    });
  }

  return { page };
};

// Define and render the page.
export default function Page() {
  // Use the useLoaderData hook to get the Page data from `loader` above.
  const { page } = useLoaderData<typeof loader>();

  // Render the page content from Builder.io
  return <Content model="page" apiKey={apiKey} content={page as any} />;
}
