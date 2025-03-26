import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';

const MODEL_NAME = 'blog-article';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export default async function BlogArticlePage({
  params,
}: {
  params: { handle: string };
}) {
  const article = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    query: { 'data.handle': params.handle },
  });

  if (!article && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    article && (
      <div className="content">
        <h1>{article.data?.title}</h1>
        <p>{article.data?.blurb}</p>
        <img src={article.data?.image} alt={article.data?.title} />
        <Content model={MODEL_NAME} content={article} apiKey={API_KEY} />
      </div>
    )
  );
}
