import {
  BuilderContent,
  Content,
  fetchEntries,
  fetchOneEntry,
  isEditing,
  isPreviewing,
} from '@builder.io/sdk-react/edge';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

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
export default function Page(props: { page: BuilderContent | null }) {
  const router = useRouter();

  // console.log('page', router.asPath);

  const prev = isPreviewing(router.asPath);
  const edit = isEditing(router.asPath);
  // console.log({ prev, edit });

  const canShowContent = props.page || prev || edit;

  // If the page content is not available
  // and not in preview mode, show a 404 error page
  if (!canShowContent) {
    console.log('rendering 404', { canShowContent, prev, edit, page: props.page });

    // return <DefaultErrorPage statusCode={404} />;
  }

  console.log('rendering content');

  // If the page content is available, render
  // the BuilderComponent with the page content
  return (
    <>
      <Head>
        <title>{props.page?.data?.title}</title>
      </Head>
      {/* Render the Builder page */}
      <Content model="page" content={props.page} apiKey={BUILDER_PUBLIC_API_KEY} />
    </>
  );
}
