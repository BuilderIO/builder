import { BuilderContent, Content, fetchOneEntry } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'collection-hero';

export default function ProductHero() {
  const [productHero, setProductHero] = useState<BuilderContent | null>(null);

  useEffect(() => {
    fetchOneEntry({
      model: MODEL_NAME,
      apiKey: BUILDER_API_KEY,
      userAttributes: { urlPath: window.location.pathname },
    }).then((data) => {
      setProductHero(data);
    });
  }, []);

  return (
    <>
      {productHero && (
        <Content
          content={productHero}
          model={MODEL_NAME}
          apiKey={BUILDER_API_KEY}
        />
      )}
    </>
  );
}
