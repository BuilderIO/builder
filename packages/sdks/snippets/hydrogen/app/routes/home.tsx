import {fetchOneEntry, Content, isPreviewing} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';

const model = 'homepage';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

export const loader: LoaderFunction = async ({request}) => {
  const url = new URL(request.url);
  const content = await fetchOneEntry({
    model: model,
    apiKey: apiKey,
  });

  return {content, searchParams: Object.fromEntries(url.searchParams)};
};
export default function Home() {
  const {content, searchParams} = useLoaderData<{
    content: any;
    searchParams: Record<string, string>;
  }>();

  const canShowContent = content || isPreviewing(searchParams);

  return canShowContent ? (
    <Content model={model} content={content} apiKey={apiKey} />
  ) : (
    <div>404</div>
  );
}
