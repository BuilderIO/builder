import { Content, fetchOneEntry } from '@builder.io/sdk-react';
import React from 'react';

export default async function ProductHeroPage() {
  const productHero = await fetchOneEntry({
    model: 'collection-hero',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: { urlPath: '/marketing-event' },
  });

  return (
    <>
      {/* Your nav goes here */}
      {/* Hero Section */}
      {productHero && (
        <Content
          model="collection-hero"
          content={productHero}
          apiKey="ee9f13b4981e489a9a1209887695ef2b"
        />
      )}
      {/* The rest of your page goes here */}
    </>
  );
}
