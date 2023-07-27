import React from 'react';
import { builder } from '@builder.io/sdk';
import Head from 'next/head';
import { RenderBuilderContent } from '@/components/builder';

// Replace with your Public API Key
builder.init('YJIGb4i01jvw0SRdL5Bt');

interface PageProps {
  params: {
    page: string[];
  };
}

export default async function Page(props: PageProps) {
  const content = await builder
    .get('page', {
      userAttributes: {
        urlPath: '/' + (props?.params?.page?.join('/') || ''),
      },
      prerender: false,
    })
    .toPromise();

  return (
    <>
      <Head>
        <title>{content?.data.title}</title>
      </Head>
      {/* Render the Builder page */}
      <RenderBuilderContent content={content} />
    </>
  );
}
