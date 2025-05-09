import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';

const MODEL = 'homepage';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const useHomepage = routeLoader$(async () => {
  return await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
  });
});

export default component$(() => {
  const content = useHomepage();

  return (
    <div>
      {content.value || isPreviewing() ? (
        <Content model={MODEL} content={content.value} apiKey={API_KEY} />
      ) : (
        <div>404</div>
      )}
    </div>
  );
});
