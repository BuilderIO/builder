/**
 * Quickstart snippet
 * snippets/nextjs-app-dir/app/[[...slug]].tsx
 * Uses @builder.io/sdk-react-nextjs
 */
import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
  isPreviewing,
} from '@builder.io/sdk-react-nextjs';

interface PageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

const PUBLIC_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

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
