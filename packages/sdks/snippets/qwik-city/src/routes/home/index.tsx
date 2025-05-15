import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';

const model = 'homepage';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

export const useHomepage = routeLoader$(async () => {
  return await fetchOneEntry({
    model,
    apiKey,
  });
});

export default component$(() => {
  const content = useHomepage();

  return (
    <div>
      {content.value || isPreviewing() ? (
        <Content model={model} content={content.value} apiKey={apiKey} />
      ) : (
        <div>404</div>
      )}
    </div>
  );
});
