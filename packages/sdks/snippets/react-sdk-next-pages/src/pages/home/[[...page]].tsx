import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  const content = await fetchOneEntry({
    model: 'homepage',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
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
  if (!content && !isPreviewing()) return <div>404</div>;
  return (
    <Content
      model="homepage"
      content={content}
      apiKey="ee9f13b4981e489a9a1209887695ef2b"
    />
  );
}
