/**
 * Quickstart snippet
 * snippets/nextjs-app-dir-client/app/[[...slug]].tsx
 * Uses @builder.io/sdk-react
 */
import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
  isPreviewing,
} from '@builder.io/sdk-react/edge';

interface PageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

const PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

export default async function Page(props: PageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');

  const content = await fetchOneEntry({
    options: getBuilderSearchParams(props.searchParams),
    apiKey: PUBLIC_API_KEY,
    model: 'page',
    userAttributes: { urlPath },
  });

  const canShowContent = content || isPreviewing(props.searchParams);

  if (!canShowContent) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at Builder.io.</p>
      </>
    );
  }
  return <Content content={content} apiKey={PUBLIC_API_KEY} model="page" />;
}
