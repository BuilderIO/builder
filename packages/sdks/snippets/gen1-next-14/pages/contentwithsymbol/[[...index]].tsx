/**
 * Quickstart snippet
 * snippets/gen1-nextjs/pages/[[...index]].tsx
 */
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import type { BuilderContent } from '@builder.io/sdk';
import type { GetStaticProps } from 'next';
import DefaultErrorPage from 'next/error';
import React from 'react';

builder.init('ee9f13b4981e489a9a1209887695ef2b');
builder.apiEndpoint = 'content';

export const getStaticProps: GetStaticProps = async () => {
  const urlPath = '/contentwithsymbol';

  const page = await builder
    .get('page', {
      userAttributes: {
        urlPath,
      },
    })
    .promise();

  return {
    props: {
      page: page || null,
    },
    revalidate: 5,
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default function Page({ page }: { page: BuilderContent | null }) {
  const isPreviewing = useIsPreviewing();

  if (!page && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <>
      <h1>CORRECT</h1>
      {/* Render the Builder page */}
      <BuilderComponent model="page" content={page || undefined} />
    </>
  );
}
