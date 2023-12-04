import {
  _processContentResult,
  getBuilderSearchParams,
  getContent,
} from '@builder.io/sdk-react/server';
import { getProps } from '@e2e/tests';

import { RenderContent } from '@builder.io/sdk-react';

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
    getContent,
  });

  if (!builderProps.content) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    );
  }
  return <RenderContent {...builderProps} />;
}

export const revalidate = 4;
