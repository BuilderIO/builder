/**
 * Quickstart snippet
 * snippets/qwik-city/src/routes/[...index]/index.tsx
 */
import { $, component$, useOnDocument } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
  setClientUserAttributes,
} from '@builder.io/sdk-qwik';

// Define Builder's public API key and content model.
// TO DO: Replace with your Public API Key
export const BUILDER_PUBLIC_API_KEY = 'ad30f9a246614faaa6a03374f83554c9';
export const BUILDER_MODEL = 'page';

// Define a route loader function that loads
// content from Builder based on the URL.
export const useBuilderContent = routeLoader$(async ({ url }) => {
  // Fetch content for the specified model using the API key.
  const builderContent = await fetchOneEntry({
    model: BUILDER_MODEL,
    apiKey: BUILDER_PUBLIC_API_KEY,
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: {
      urlPath: url.pathname,
    },
  });

  // Return the fetched content.
  return builderContent;
});

// Define a component that renders Builder content
// using Qwik's Content component.
export default component$(() => {
  // Call the useBuilderContent function to get the content.
  const content = useBuilderContent();
  // Specify the content model, pass the fetched content,
  // and provide the Public API Key

  useOnDocument(
    'qinit',
    $(() => {
      setClientUserAttributes({
        device: 'desktop',
      });

      // setInterval(() => {
      //   const attr = Math.random() > 0.5 ? 'desktop' : 'tablet';
      //   console.log('setting device to', attr);
      //   setClientUserAttributes({
      //     device: attr,
      //   });
      // }, 1000);
    })
  );
  return (
    <Content
      model={BUILDER_MODEL}
      content={content.value}
      apiKey={BUILDER_PUBLIC_API_KEY}
    />
  );
});
