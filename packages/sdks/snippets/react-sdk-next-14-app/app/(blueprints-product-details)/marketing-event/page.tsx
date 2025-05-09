import { Content, fetchOneEntry } from '@builder.io/sdk-react';
import React from 'react';

const MODEL = 'collection-hero';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export default async function ProductHeroPage() {
  const productHero = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    userAttributes: { urlPath: '/marketing-event' },
  });

  return (
    <>
      {/* Your nav goes here */}
      {/* Hero Section */}
      {productHero && (
        <Content model={MODEL} content={productHero} apiKey={API_KEY} />
      )}
      {/* The rest of your page goes here */}
    </>
  );
}
