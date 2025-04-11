import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-qwik';

export const useProductHero = routeLoader$(async ({ url }) => {
  return await fetchOneEntry({
    model: 'collection-hero',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: {
      urlPath: url.pathname,
    },
  });
});

export default component$(() => {
  const productHero = useProductHero();

  return (
    <>
      {/* Your nav goes here */}
      {/* Hero Section */}
      {productHero.value && (
        <Content
          model="collection-hero"
          content={productHero.value}
          apiKey="ee9f13b4981e489a9a1209887695ef2b"
        />
      )}
      {/* The rest of your page goes here */}
    </>
  );
});
