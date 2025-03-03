import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { BuilderContent } from '@builder.io/sdk-qwik';
import { subscribeToEditor } from '@builder.io/sdk-qwik';

export default component$(() => {
  const content = useSignal<BuilderContent | null>(null);

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
