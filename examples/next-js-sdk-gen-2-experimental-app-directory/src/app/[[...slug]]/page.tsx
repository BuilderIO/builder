import { RenderContent, getBuilderSearchParams, getContent } from '@builder.io/sdk-react-nextjs';

interface MyPageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

const apiKey = 'f1a790f8c3204b3b8c5c1795aeac4660';

export default async function Page(props: MyPageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');

  const content = await getContent({
    model: 'page',
    apiKey,
    options: getBuilderSearchParams(props.searchParams),
    userAttributes: { urlPath },
  });

  return <RenderContent content={content} model="page" apiKey={apiKey} />;
}
export const revalidate = 1;
