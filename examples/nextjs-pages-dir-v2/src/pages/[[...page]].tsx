import { Content } from '@builder.io/sdk-react';
import {
  BuilderContent,
  fetchEntries,
  fetchOneEntry,
  isPreviewing,
} from '@builder.io/sdk-react/server';
import { GetStaticProps } from 'next';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';

// Replace with your Public API Key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

// Define a function that fetches the Builder
// content for a given page
export const getStaticProps: GetStaticProps = async ({ params }) => {
  // Fetch the builder content for the given page
  const urlPath = '/' + (params?.page?.join('/') || '');

  const page = await fetchOneEntry({
    apiKey: BUILDER_PUBLIC_API_KEY,
    model: 'page',
    userAttributes: { urlPath },
  });

  // Return the page content as props
  return {
    props: { page },
    // Revalidate the content every 5 seconds
    revalidate: 5,
  };
};

// Define a function that generates the
// static paths for all pages in Builder
export async function getStaticPaths() {
  // Get a list of all pages in Builder
  const pages = await fetchEntries({
    apiKey: BUILDER_PUBLIC_API_KEY,
    model: 'page',
    // We only need the URL field
    fields: 'data.url',
    options: { noTargeting: true },
  });

  // Generate the static paths for all pages in Builder
  return {
    paths: pages.map(page => `${page.data?.url}`).filter(url => url !== '/'),
    fallback: 'blocking',
  };
}

// Define the Page component
export default function Page({ page }: { page: BuilderContent | null }) {
  // If the page content is not available
  // and not in preview mode, show a 404 error page
  if (!page && !isPreviewing()) {
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
      <Content model="page" content={page} apiKey={BUILDER_PUBLIC_API_KEY} />
    </>
  );
}
