import type {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {fetchOneEntry, Content, isPreviewing} from '@builder.io/sdk-react';

const MODEL = 'blog-article';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const loader = async ({params, request}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const content = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    query: {'data.handle': params.handle},
  });
  return {content, searchParams: Object.fromEntries(url.searchParams)};
};

export default function BlogArticlePage() {
  const {content, searchParams} = useLoaderData<{
    content: any;
    searchParams: Record<string, string>;
  }>();

  const canShowContent = content || isPreviewing(searchParams);

  return canShowContent ? (
    <div className="content">
      <h1>{content.data?.title}</h1>
      <p>{content.data?.blurb}</p>
      <img src={content.data?.image} alt={content.data?.title} />
      <Content model={MODEL} content={content} apiKey={API_KEY} />
    </div>
  ) : (
    <div>404</div>
  );
}
