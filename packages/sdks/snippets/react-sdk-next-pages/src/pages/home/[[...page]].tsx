import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

const model = 'homepage';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

export const getServerSideProps: GetServerSideProps = async () => {
  const content = await fetchOneEntry({
    model,
    apiKey,
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
    <Content model={model} content={content} apiKey={apiKey} />
  ) : (
    <div>404</div>
  );
}
