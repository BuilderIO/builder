import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

const MODEL = 'homepage';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const getServerSideProps: GetServerSideProps = async () => {
  const content = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
  });
  return {
    props: {
      content,
    },
  };
};

export default function ProductHeroPage({
  content,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return content || isPreviewing() ? (
    <Content model={MODEL} content={content} apiKey={API_KEY} />
  ) : (
    <div>404</div>
  );
}
