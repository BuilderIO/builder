// src/pages/advanced-child/[[...page]].tsx

import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { customTabsInfo } from '../../components/CustomTabs';

const MODEL_NAME = 'advanced-child';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const getServerSideProps = (async ({ resolvedUrl }) => {
  const content = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    userAttributes: { urlPath: resolvedUrl },
  });
  return { props: { content } };
}) satisfies GetServerSideProps<{
  content: BuilderContent | null;
}>;

export default function AdvancedChildPage({
  content,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!content && !isPreviewing()) {
    return <div>404</div>;
  }
  return (
    <Content
      content={content}
      model={MODEL_NAME}
      apiKey={API_KEY}
      customComponents={[customTabsInfo]}
    />
  );
}
