import { Content as BrowserContent } from '@builder.io/sdk-react/browser';
import { Content as EdgeContent } from '@builder.io/sdk-react/edge';
import {
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-react/server';
import { getProps } from '@e2e/tests';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

interface PageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

// Pages are Server Components by default
export default async function Page(props: PageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');

  const builderProps = await getProps({
    pathname: urlPath,
    _processContentResult,
    options: getBuilderSearchParams(props.searchParams),
    fetchOneEntry,
  });

  if (!builderProps.content) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    );
  }
  return isBrowser() ? (
    <BrowserContent {...builderProps} />
  ) : (
    <EdgeContent {...builderProps} />
  );
}

export const revalidate = 4;
