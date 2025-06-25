import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';

const MODEL = 'collection-hero';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export default async function ProductHeroPage({
  params,
}: {
  params: { slug: string };
}) {
  const productHero = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    userAttributes: { urlPath: `/${params.slug}` },
  });

  return (
    <>
      {/* Your nav goes here */}
      {/* Hero Section */}
      {productHero || isPreviewing() ? (
        <Content model={MODEL} content={productHero} apiKey={API_KEY} />
      ) : (
        <div>404</div>
      )}
      {/* The rest of your page goes here */}
    </>
  );
}
