import {fetchOneEntry, Content, isPreviewing} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';

const MODEL = 'homepage';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const loader: LoaderFunction = async () => {
  const content = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
  });

  return {content};
};
export default function Home() {
  const {content} = useLoaderData<typeof loader>();

  return content || isPreviewing() ? (
    <Content model={MODEL} content={content} apiKey={API_KEY} />
  ) : (
    <div>404</div>
  );
}
