// path of file: `src/app/[[...slug]]/page.tsx`
import { fetchEntries } from '@builder.io/sdk-react/edge';
import { useRouter } from 'next/router';

// Replace with your Public API Key
const YOUR_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

// Define the expected shape of the props
// object passed to the Page function
interface PageProps {
  params: {
    page: string[];
  };
}

// Define the Page component
export default async function Page({ params }: PageProps) {
  const router = useRouter();
  const urlPath = '/' + (Array.isArray(params?.page) ? params.page.join('/') : params?.page || '');

  // Fetch the builder content for the given page
  const links = await fetchEntries({
    apiKey: YOUR_API_KEY,
    model: 'nav-link',
    userAttributes: { urlPath },
  });

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
