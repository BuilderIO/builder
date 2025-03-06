/**
 * Quickstart snippet
 * snippets/nextjs-app-dir-client/app/[[...slug]].tsx
 * Uses @builder.io/sdk-react
 */
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';

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
    apiKey: PUBLIC_API_KEY,
    model: 'page',
    userAttributes: { urlPath },
  });

  const canShowContent = content || isPreviewing(props.searchParams);

  if (!canShowContent) {
    return <p>Not Found</p>;
  }

  return <Content content={content} apiKey={PUBLIC_API_KEY} model="page" />;
}
