import { fetchEntries } from '@builder.io/sdk-react/edge';
import { GetStaticPaths, GetStaticProps } from 'next';

// Replace with your Public API Key
const YOUR_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

// Define a function that fetches the Builder content for a given page
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const urlPath = '/' + (Array.isArray(params?.page) ? params.page.join('/') : params?.page || '');

  // Fetch the builder content for the given page
  const links = await fetchEntries({
    apiKey: YOUR_API_KEY,
    model: 'nav-link',
    userAttributes: { urlPath },
  });

  return {
    // Return the page content as props
    props: { links },
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

export default function Page({ links }) {
  return (
    <>
      <header>
        <nav>
          {links?.map((link, index) => (
            <a key={index} href={link.data.url}>
              {link.data.label}
            </a>
          ))}
        </nav>
      </header>
      <RestOfYourPage />
    </>
  );
}
