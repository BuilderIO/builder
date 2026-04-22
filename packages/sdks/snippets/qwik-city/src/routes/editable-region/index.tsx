import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';
import { customColumnsInfo } from '~/components/CustomColumns';

const MODEL = 'editable-regions';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const useCustomChild = routeLoader$(async ({ url }) => {
  const searchParams = Object.fromEntries(url.searchParams);

  const content = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    userAttributes: {
      urlPath: url.pathname,
    },
  });

  return {
    content,
    searchParams,
  };
});

export default component$(() => {
  const data = useCustomChild();

  const canShowContent =
    data.value?.content || isPreviewing(data.value?.searchParams);

  return canShowContent ? (
    <Content
      model={MODEL}
      content={data.value.content}
      apiKey={API_KEY}
      customComponents={[customColumnsInfo]}
    />
  ) : (
    <div>404</div>
  );
});
