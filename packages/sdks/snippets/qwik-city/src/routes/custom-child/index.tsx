import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';
import { customHeroInfo } from '~/components/CustomHero';

const MODEL = 'custom-child';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const useCustomChild = routeLoader$(async ({ url }) => {
  const searchParams = Object.fromEntries(url.searchParams);

  const customChild = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    userAttributes: {
      urlPath: url.pathname,
    },
  });

  return {
    customChild,
    searchParams,
  };
});

export default component$(() => {
  const {
    value: { customChild, searchParams },
  } = useCustomChild();
  const canShowContent = customChild || isPreviewing(searchParams);

  return canShowContent ? (
    <Content
      model={MODEL}
      content={customChild}
      apiKey={API_KEY}
      customComponents={[customHeroInfo]}
    />
  ) : (
    <div>404</div>
  );
});
