import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

const MODEL_NAME = 'blog-article';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const getServerSideProps = (async ({ params }) => {
  const article = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    query: { 'data.handle': params?.handle },
  });
  return { props: { article } };
}) satisfies GetServerSideProps<{
  article: BuilderContent | null;
}>;

export default function BlogArticlePage({
  article,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
