import { getContent } from '@builder.io/sdk-react/server';

// if you use VSCode and see a TS error for the line below, you can safely ignore it.
import BuilderPage from './BuilderPage';
import { API_KEY } from '../../builderConfig.js';

async function getBuilderContent(urlPath: string) {
  const page = await getContent({
    apiKey: API_KEY,
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
  searchParams: {
    [key: string]: string;
  };
}

// Pages are Server Components by default
export default async function Page(props: PageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');
  const content = await getBuilderContent(urlPath);

  const isPreviewing = props.searchParams['builder.preview'];

  if (!content.page && !isPreviewing) {
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
