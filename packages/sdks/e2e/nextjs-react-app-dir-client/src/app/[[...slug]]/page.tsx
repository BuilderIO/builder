import { getProps } from '@builder.io/sdks-e2e-tests';
import { processContentResult } from '@builder.io/sdk-react/server';

// ✅ This pattern works. You can pass a Server Component
// as a child or prop of a Client Component.
import BuilderPage from './BuilderPage';

async function getBuilderContent(urlPath: string) {
  return await getProps({ pathname: urlPath, processContentResult });
}

interface PageProps {
  params: {
    slug: string[];
  };
}

// Pages are Server Components by default
export default async function Page(props: PageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');
  const builderProps = await getBuilderContent(urlPath);

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
