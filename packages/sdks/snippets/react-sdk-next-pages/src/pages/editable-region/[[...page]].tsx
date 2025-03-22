// src/pages/editable-region/[[...page]].tsx

import { customColumnsInfo } from '@/components/CustomColumns';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React from 'react';

const MODEL_NAME = 'editable-regions';
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

export default function EditableRegionsPage({
  content,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!content) {
    return <div>404</div>;
  }
  return (
    <Content
      content={content}
      model={MODEL_NAME}
      apiKey={API_KEY}
      customComponents={[customColumnsInfo]}
    />
  );
}
