import {
  Content,
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-react/edge';
import { getProps } from '@sdk/tests';

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
  return <Content {...builderProps} />;
}

export const revalidate = 4;
