import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';

const model = 'homepage';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

export const useHomepage = routeLoader$(async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams);

  const content = await fetchOneEntry({
    model,
    apiKey,
  });

  return {
    content,
    searchParams,
  };
});

export default component$(() => {
  const data = useHomepage();

  const canShowContent =
    data.value?.content || isPreviewing(data.value?.searchParams);

  return (
    <div>
      {canShowContent ? (
        <Content model={model} content={data.value?.content} apiKey={apiKey} />
      ) : (
        <div>404</div>
      )}
    </div>
  );
});
