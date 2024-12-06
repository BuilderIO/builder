/**
 * Quickstart snippet
 * snippets/gen1-nextjs/pages/[[...index]].tsx
 */
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import type { BuilderContent } from '@builder.io/sdk';
import type { GetStaticProps } from 'next';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';
import React from 'react';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const page = await builder
    .get('page', {
      userAttributes: {
        urlPath: '/' + ((params?.index as string[])?.join('/') || ''),
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

export async function getStaticPaths() {
  const pages = await builder.getAll('page', {
    fields: 'data.url',
    options: { noTargeting: true },
  });

  return {
    paths: pages
      .map((page) => `${page.data?.url}`)
      .filter((url) => url !== '/' && !url.includes('favicon')),
    fallback: 'blocking',
  };
}

export default function Page({ page }: { page: BuilderContent | null }) {
  const isPreviewing = useIsPreviewing();

  if (!page && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <>
      <Head>
        <title>{page?.data?.title}</title>
      </Head>
      {/* Render the Builder page */}
      <BuilderComponent model="page" content={page || undefined} />
    </>
  );
}
