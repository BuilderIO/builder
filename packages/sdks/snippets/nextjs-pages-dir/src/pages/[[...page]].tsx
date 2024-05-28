/**
 * Quickstart snippet
 * snippets/nextjs-pages-dir/src/pages/[[...page.tsx]]
 * Catch all route to build and render content from Builder.io in SSG mode
 */
import type { BuilderContent } from '@builder.io/sdk-react';
import {
  Content,
  fetchEntries,
  fetchOneEntry,
  isPreviewing,
} from '@builder.io/sdk-react';
import type { GetStaticProps } from 'next';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';

const BUILDER_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

// Define a function that fetches the Builder content for a given page
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const urlPath =
    '/' +
    (Array.isArray(params?.page) ? params.page.join('/') : params?.page || '');

  // Fetch the builder content for the given page
  const page = await fetchOneEntry({
    apiKey: BUILDER_API_KEY,
    model: 'page',
    userAttributes: { urlPath },
  });

  return {
    // Return the page content as props
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
    apiKey: BUILDER_API_KEY,
    model: 'page',
    // We only need the URL field
    fields: 'data.url',
    options: { noTargeting: true },
  });

  // Generate the static paths for all pages in Builder
  return {
    paths: pages.map((page) => `${page.data?.url}`),
    fallback: 'blocking',
  };
}

// Define the Page component
export default function Page(props: { page: BuilderContent | null }) {
  const router = useRouter();

  const canShowContent = props.page || isPreviewing(router.asPath);

  // If the page content is not available
  // and not in preview/editing mode, show a 404 error page
  if (!canShowContent) {
    return <DefaultErrorPage statusCode={404} />;
  }

  // If the page content is available, render
  // the BuilderComponent with the page content
  return (
    <>
      <Head>
        <title>{props.page?.data?.title}</title>
      </Head>
      {/* Render the Builder page */}
      <Content model="page" content={props.page} apiKey={BUILDER_API_KEY} />
    </>
  );
}
