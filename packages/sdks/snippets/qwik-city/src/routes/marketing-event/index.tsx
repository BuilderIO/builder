import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';

const MODEL = 'collection-hero';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const useProductHero = routeLoader$(async ({ url }) => {
  return await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
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
      {productHero.value || isPreviewing() ? (
        <Content model={MODEL} content={productHero.value} apiKey={API_KEY} />
      ) : (
        <div>404</div>
      )}
      {/* The rest of your page goes here */}
    </>
  );
});
