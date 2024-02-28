import {
  BuilderContent,
  Content,
  fetchOneEntry,
  isEditing,
  isPreviewing,
} from '@builder.io/sdk-react/edge';
import { GetStaticPaths, GetStaticProps } from 'next';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Replace with your Public API Key
const YOUR_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

// Define a function that fetches the Builder content for a given page
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const urlPath = '/' + (Array.isArray(params?.page) ? params.page.join('/') : params?.page || '');

  // Fetch the builder content for the given page
  const announcementBar = await fetchOneEntry({
    apiKey: YOUR_API_KEY,
    model: 'announcement-bar',
    userAttributes: { urlPath },
  });

  return {
    // Return the page content as props
    props: { announcementBar },
    // Revalidate the content every 5 seconds
    revalidate: 5,
  };
};

// Define a function that generates the
// static paths for all pages in Builder
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

// Define the Page component
export default function Page(props: { announcementBar: BuilderContent | null }) {
  const router = useRouter();

  const canShowContent =
    props.announcementBar || isPreviewing(router.asPath) || isEditing(router.asPath);

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
        <title>{props.announcementBar?.data?.title}</title>
      </Head>
      {/* Put your header here. */}
      <YourHeader />
      {<Content content={props.announcementBar} model="announcement-bar" apiKey={YOUR_API_KEY} />}
      {/* Put the rest of your page here. */}
      <TheRestOfYourPage />
    </>
  );
}
