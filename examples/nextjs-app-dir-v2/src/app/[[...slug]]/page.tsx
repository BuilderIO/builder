import { Content } from '@builder.io/sdk-react/edge';
import { fetchOneEntry } from '@builder.io/sdk-react/server';

const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

interface PageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

// Pages are Server Components by default
export default async function Page(props: PageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');

  const content = await fetchOneEntry({
    options: props.searchParams,
    apiKey: BUILDER_PUBLIC_API_KEY,
    model: 'page',
    userAttributes: { urlPath },
  });

  if (!content) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    );
  }
  return <Content content={content} apiKey={BUILDER_PUBLIC_API_KEY} model={'page'} />;
}
