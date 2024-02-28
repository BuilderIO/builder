// path of file: `src/app/[[...slug]]/page.tsx`
import { Content, fetchOneEntry, isEditing, isPreviewing } from '@builder.io/sdk-react/edge';
import DefaultErrorPage from 'next/error';
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
  const announcement = await fetchOneEntry({
    apiKey: YOUR_API_KEY,
    model: 'announcement-bar',
    userAttributes: { urlPath },
  });

  const canShowContent = announcement || isPreviewing(router.asPath) || isEditing(router.asPath);

  // If the page content is not available
  // and not in preview/editing mode, show a 404 error page
  if (!canShowContent) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <>
      {/* Put your header here. */}
      <YourHeader />
      {announcement && (
        <Content content={announcement} model="announcement-bar" apiKey={YOUR_API_KEY} />
      )}
      {/* Put the rest of your page here. */}
      <TheRestOfYourPage />
    </>
  );
}
