import { builderBlockWithClassNameComponentConfig } from '@/components/BuilderBlockWithClassName';
import ClientContent from '@/components/ClientContent';
import {
  Content,
  _processContentResult,
  fetchOneEntry,
} from '@builder.io/sdk-react';
import { getProps } from '@sdk/tests';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<Record<string, string>>;
}

// Pages are Server Components by default
export default async function Page(props: PageProps) {
  const urlPath = '/' + ((await props.params)?.slug?.join('/') || '');

  const builderProps = await getProps({
    pathname: urlPath,
    _processContentResult,
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

  builderProps.customComponents = [builderBlockWithClassNameComponentConfig];

  if (urlPath === '/variant-containers') {
    return <ClientContent {...builderProps} />;
  }

  return <Content {...builderProps} />;
}

export const revalidate = 4;
