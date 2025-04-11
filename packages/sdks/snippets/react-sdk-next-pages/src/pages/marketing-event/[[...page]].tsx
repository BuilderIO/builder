import { Content, fetchOneEntry } from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps = async ({
  resolvedUrl,
}) => {
  const productHero = await fetchOneEntry({
    model: 'collection-hero',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: { urlPath: resolvedUrl },
  });

  return { props: { productHero } };
};

export default function ProductHeroPage({
  productHero,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
