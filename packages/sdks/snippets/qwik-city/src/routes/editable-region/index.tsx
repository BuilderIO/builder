import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';
import { customColumnsInfo } from '~/components/CustomColumns';

const MODEL = 'editable-regions';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const useCustomChild = routeLoader$(async ({ url }) => {
  return await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    userAttributes: {
      urlPath: url.pathname,
    },
  });
});

export default component$(() => {
  const content = useCustomChild();

  if (!content.value && !isPreviewing()) {
    return <div>404</div>;
  }
  return (
    <Content
      model={MODEL}
      content={content.value}
      apiKey={API_KEY}
      customComponents={[customColumnsInfo]}
    />
  );
});
