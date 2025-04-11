import {fetchOneEntry, Content, isPreviewing} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';

export const loader: LoaderFunction = async () => {
  const content = await fetchOneEntry({
    model: 'homepage',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });

  return {content};
};
export default function Home() {
  const {content} = useLoaderData<typeof loader>();

  if (!content && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    <Content
      model="homepage"
      content={content}
      apiKey="ee9f13b4981e489a9a1209887695ef2b"
    />
  );
}
