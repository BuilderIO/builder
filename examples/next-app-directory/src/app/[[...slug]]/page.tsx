import { getContent } from '@builder.io/sdk-react/get-content';

// ✅ This pattern works. You can pass a Server Component
// as a child or prop of a Client Component.
import BuilderPage from './BuilderPage';
import builderConfig from '../../../builderConfig.json';

async function getBuilderContent(urlPath: string) {
  const page = await getContent({
    apiKey: builderConfig.apiKey,
    model: 'page',
    userAttributes: { urlPath },
  });

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  return {
    page: page || null,
  };
}

interface PageProps {
  params: {
    slug: string[];
  };
}

// Pages are Server Components by default
export default async function Page(props: PageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');
  const content = await getBuilderContent(urlPath);

  if (!content.page) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    );
  }
  return <BuilderPage builderContent={content.page} />;
}

export const revalidate = 4;
