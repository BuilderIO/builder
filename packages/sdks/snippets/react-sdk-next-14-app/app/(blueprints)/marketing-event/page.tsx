import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';
import { headers } from 'next/headers';

const model = 'collection-hero';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

export default async function ProductHeroPage() {
  const pathname = headers().get('x-pathname') as string;

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
