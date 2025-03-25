import type {LoaderFunctionArgs} from '@remix-run/node';
import {json, useLoaderData} from '@remix-run/react';
import {fetchOneEntry, Content, isPreviewing} from '@builder.io/sdk-react';

const MODEL = 'blog-article';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const loader = async ({params}: LoaderFunctionArgs) => {
  const content = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    query: {'data.handle': params.handle},
  });
  return {content};
};
export default function BlogArticlePage() {
  const {content} = useLoaderData<{content: any}>();

  if (!content && !isPreviewing()) return <div>404</div>;

  return (
    <div className="content">
      <h1>{content.data?.title}</h1>
      <p>{content.data?.blurb}</p>
      <img src={content.data?.image} alt={content.data?.title} />
      <Content model={MODEL} content={content} apiKey={API_KEY} />
    </div>
  );
}
