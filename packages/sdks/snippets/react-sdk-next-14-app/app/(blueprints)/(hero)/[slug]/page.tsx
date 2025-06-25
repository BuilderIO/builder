import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';

const model = 'collection-hero';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

export default async function ProductHeroPage({
  params,
}: {
  params: { slug: string };
}) {
  const pathname = `/${params.slug}`;

  const productHero = await fetchOneEntry({
    model,
    apiKey,
    userAttributes: {
      urlPath: pathname,
    },
  });

  return (
    <>
      {/* Your nav goes here */}
      {/* Hero Section */}
      {productHero || isPreviewing() ? (
        <Content model={model} content={productHero} apiKey={apiKey} />
      ) : (
        <div>404</div>
      )}
      {/* The rest of your page goes here */}
    </>
  );
}
