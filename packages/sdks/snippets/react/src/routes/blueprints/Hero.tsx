import { BuilderContent, Content, fetchOneEntry } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

export default function ProductHero() {
  const [productHero, setProductHero] = useState<BuilderContent | null>(null);

  useEffect(() => {
    fetchOneEntry({
      model: 'collection-hero',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      userAttributes: { urlPath: window.location.pathname },
    }).then((data) => {
      setProductHero(data);
    });
  }, []);

  return (
    <>
      {/* Your nav goes here */}

      {/* Render the Hero content if available */}
      {productHero && (
        <Content
          content={productHero}
          model="collection-hero"
          apiKey="ee9f13b4981e489a9a1209887695ef2b"
        />
      )}

      {/* The rest of your page goes here */}
    </>
  );
}
