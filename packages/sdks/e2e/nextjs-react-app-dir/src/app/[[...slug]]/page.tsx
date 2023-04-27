import { getProps } from '@builder.io/sdks-e2e-tests';

// ✅ This pattern works. You can pass a Server Component
// as a child or prop of a Client Component.
import BuilderPage from './BuilderPage';

function getBuilderContent(urlPath: string) {
  return getProps(urlPath);
}

interface PageProps {
  params: {
    slug: string[];
  };
}

// Pages are Server Components by default
export default async function Page(props: PageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');
  const builderProps = getBuilderContent(urlPath);

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
