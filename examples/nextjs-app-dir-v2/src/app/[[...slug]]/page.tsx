import { Content, fetchOneEntry, isEditing, isPreviewing } from '@builder.io/sdk-react';

const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

interface PageProps {
  params: { slug: string[] };
  searchParams: Record<string, string>;
}

export default async function Page(props: PageProps) {
  // NOTE: the import must be inside the Page component itself.
  const { initializeNodeRuntime } = await import('@builder.io/sdk-react/node/init');
  initializeNodeRuntime();

  const urlPath = '/' + (props.params?.slug?.join('/') || '');

  const content = await fetchOneEntry({
    options: props.searchParams,
    apiKey: BUILDER_PUBLIC_API_KEY,
    model: 'page',
    userAttributes: { urlPath },
  });

  const canShowContent =
    content || isPreviewing(props.searchParams) || isEditing(props.searchParams);

  if (!canShowContent) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    );
  }
  return <Content content={content} apiKey={BUILDER_PUBLIC_API_KEY} model={'page'} />;
}
