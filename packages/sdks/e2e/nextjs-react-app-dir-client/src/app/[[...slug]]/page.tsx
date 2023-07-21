import { getProps } from '@builder.io/sdks-e2e-tests';
import { processContentResult, getContent } from '@builder.io/sdk-react/server';
import { getBuilderSearchParams } from '@builder.io/sdk-react';
import BuilderPage from './BuilderPage';

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
    processContentResult,
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
  return <BuilderPage builderProps={builderProps} />;
}

export const revalidate = 4;
