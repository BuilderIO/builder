import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
  isEditing,
  isPreviewing,
} from '@builder.io/sdk-react';
import { customComponents } from '../components/register';

// Public API key (safe to expose in the browser). Falls back to a demo key; set
// NEXT_PUBLIC_BUILDER_API_KEY in .env.local to use your own space.
const BUILDER_PUBLIC_API_KEY =
  process.env.NEXT_PUBLIC_BUILDER_API_KEY || 'f1a790f8c3204b3b8c5c1795aeac4660';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

export default async function Page(props: PageProps) {
  // NOTE: the import must be inside the Page component itself.
  const { initializeNodeRuntime } = await import('@builder.io/sdk-react/node/init');
  initializeNodeRuntime();

  // In Next.js 15+, `params` and `searchParams` are Promises.
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const urlPath = '/' + (slug?.join('/') || '');

  const content = await fetchOneEntry({
    // Forwards Builder-specific query params (e.g. preview/editing) to the API.
    options: getBuilderSearchParams(searchParams),
    apiKey: BUILDER_PUBLIC_API_KEY,
    model: 'page',
    userAttributes: { urlPath },
  });

  const canShowContent = content || isPreviewing(searchParams) || isEditing(searchParams);

  if (!canShowContent) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    );
  }
  return (
    <Content
      content={content}
      apiKey={BUILDER_PUBLIC_API_KEY}
      model="page"
      customComponents={customComponents}
    />
  );
}
