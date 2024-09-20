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

// Replace with your Public API Key
builder.init('ee9f13b4981e489a9a1209887695ef2b');

// Define a function that fetches the Builder
// content for a given page
export const getStaticProps: GetStaticProps = async ({ params }) => {
  // Fetch the builder content for the given page
  const page = await builder
    .get('page', {
      userAttributes: {
        urlPath: '/' + ((params?.index as string[])?.join('/') || ''),
      },
    })
    .promise();

  // Return the page content as props
  return {
    props: {
      page: page || null,
    },
    // Revalidate the content every 5 seconds
    revalidate: 5,
  };
};

// Define a function that generates the
// static paths for all pages in Builder
export async function getStaticPaths() {
  // Get a list of all pages in Builder
  const pages = await builder.getAll('page', {
    // We only need the URL field
    fields: 'data.url',
    options: { noTargeting: true },
  });

  // Generate the static paths for all pages in Builder
  return {
    paths: pages
      .map((page) => `${page.data?.url}`)
      .filter((url) => url !== '/' && !url.includes('favicon')),
    fallback: 'blocking',
  };
}

// Define the Page component
export default function Page({ page }: { page: BuilderContent | null }) {
  const isPreviewing = useIsPreviewing();

  // If the page content is not available
  // and not in preview mode, show a 404 error page
  if (!page && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />;
  }

  // If the page content is available, render
  // the BuilderComponent with the page content
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
