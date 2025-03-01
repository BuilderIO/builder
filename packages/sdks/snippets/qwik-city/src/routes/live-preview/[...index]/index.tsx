import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { BuilderContent } from '@builder.io/sdk-qwik';
import {
  fetchOneEntry,
  getBuilderSearchParams,
  subscribeToEditor,
} from '@builder.io/sdk-qwik';

export const useBuilderContent = routeLoader$(async ({ url }) => {
  const data = await fetchOneEntry({
    model: 'blog-data',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: {
      urlPath: url.pathname,
    },
  });
  return data;
});

export default component$(() => {
  const builderContent = useBuilderContent();

  const content = useSignal<BuilderContent | null>(builderContent.value);

  useVisibleTask$(() => {
    const unsubscribe = subscribeToEditor({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      callback: (updatedContent) => {
        content.value = updatedContent;
      },
    });
    return () => {
      unsubscribe();
    };
  });

  return (
    <>
      {!content.value && <div>Loading...</div>}

      {content.value && (
        <div class="blog-data-preview">
          <div>Blog Title: {content.value?.data?.title}</div>
          <div>Authored by: {content.value?.data?.author}</div>
          <div>Handle: {content.value?.data?.handle}</div>
        </div>
      )}
    </>
  );
});
