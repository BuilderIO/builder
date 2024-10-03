/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * snippets/gen1-nextjs/pages/announcements/[...index].tsx
 */
import { BuilderComponent, builder } from '@builder.io/react';
import type { BuilderContent } from '@builder.io/sdk';
import type { GetStaticProps } from 'next';
import React from 'react';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const urlPath =
    '/announcements/' +
    (Array.isArray(params?.index)
      ? params.index.join('/')
      : params?.index || '');

  const announcementBar = await builder
    .get('announcement-bar', {
      userAttributes: {
        urlPath,
      },
    })
    .promise();

  return {
    props: {
      announcementBar: announcementBar || null,
    },
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default function Page({
  announcementBar,
}: {
  announcementBar: BuilderContent | null;
}) {
  return (
    <>
      {announcementBar && (
        <BuilderComponent model="announcement-bar" content={announcementBar} />
      )}
      {/* content coming from your app (or also Builder) */}
      <div>The rest of your page goes here</div>
    </>
  );
}
