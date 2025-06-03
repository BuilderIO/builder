import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';
import { customTabsInfo } from '~/components/CustomTabs';

const MODEL = 'advanced-child';
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
  const content = useCustomChild();

  const canShowContent =
    content.value?.content || isPreviewing(content.value?.searchParams);

  return canShowContent ? (
    <Content
      model={MODEL}
      content={content.value?.content}
      apiKey={API_KEY}
      customComponents={[customTabsInfo]}
    />
  ) : (
    <div>404</div>
  );
});
