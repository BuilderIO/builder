import {fetchOneEntry, Content, isPreviewing} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';

const model = 'homepage';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

export const loader: LoaderFunction = async () => {
  const content = await fetchOneEntry({
    model: model,
    apiKey: apiKey,
  });

  return {content};
};
export default function Home() {
  const {content} = useLoaderData<typeof loader>();

  return content || isPreviewing() ? (
    <Content model={model} content={content} apiKey={apiKey} />
  ) : (
    <div>404</div>
  );
}
