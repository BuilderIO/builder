import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { fetchOneEntry, subscribeToEditor } from '@builder.io/sdk-qwik';

// Enter your key here!
export const apiKey = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

export const useBuilderContentLoader = routeLoader$(async event => {
  const data = await fetchOneEntry({
    model: 'coffee',
    apiKey: apiKey,
  });

  if (!data) {
    throw event.error(404, 'page not found');
  }

  return data;
});

export default component$(() => {
  const fetchedContent = useBuilderContentLoader();

  const content = useSignal(fetchedContent.value);

  useVisibleTask$(() => {
    const unsubscribe = subscribeToEditor('coffee', newContent => {
      content.value = newContent;
    });

    return () => unsubscribe();
  });

  return content.value ? (
    <>
      <div>coffee name: {content.value.data?.name}</div>
      <div>coffee info: {content.value.data?.info}</div>
    </>
  ) : (
    <div>Loading...</div>
  );
});
