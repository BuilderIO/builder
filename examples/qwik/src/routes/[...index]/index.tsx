import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import { isBrowser } from '@builder.io/qwik/build';
import { fetchOneEntry, getBuilderSearchParams } from '@builder.io/sdk-qwik';
import { Content as EdgeContent } from '@builder.io/sdk-qwik/bundle/edge';
import { Content as BrowserContent } from '@builder.io/sdk-qwik/bundle/browser';
import { CUSTOM_COMPONENTS } from '../../components/builder-registry';

export const Content = isBrowser ? BrowserContent : EdgeContent;

const BUILDER_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

// This page is a catch-all for all routes that don't have a pre-defined route.
// Using a catch-all route allows you to dynamically create new pages in Builder.

// Use the `useBuilderContent` route loader to get your content from Builder.
// `routeLoader$()` takes an async function to fetch content
// from Builder with using `fetchOneEntry()`.
export const useBuilderContent = routeLoader$(async ({ url, error }) => {
  const isPreviewing = url.searchParams.has('builder.preview');

  // Fetch Builder.io Visual CMS content using the Qwik SDK.
  // The public API key is set in the .env file at the root
  // https://www.builder.io/c/docs/using-your-api-key
  const builderContent = await fetchOneEntry({
    model: 'page',
    apiKey: BUILDER_API_KEY,
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: {
      urlPath: url.pathname,
    },
  });

  // If there's no content, throw a 404.
  // You can use your own 404 component here
  if (!builderContent && !isPreviewing) {
    throw error(404, 'Page not found');
  }

  // return content fetched from Builder, which is JSON
  return builderContent;
});

export default component$(() => {
  const builderContent = useBuilderContent();

  // Content component uses the `content` prop to render
  // the page, specified by the API Key, at the current URL path.
  return (
    <Content
      model="page"
      content={builderContent.value}
      apiKey={BUILDER_API_KEY}
      customComponents={CUSTOM_COMPONENTS}
    />
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const builderContent = resolveValue(useBuilderContent);
  return {
    title: builderContent?.data?.title,
  };
};
