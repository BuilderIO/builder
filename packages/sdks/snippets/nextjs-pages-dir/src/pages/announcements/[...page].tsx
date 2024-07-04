/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/pages/announcements/[...page].tsx
 */
import {
  Content,
  fetchEntries,
  fetchOneEntry,
  isEditing,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const model = 'announcement-bar';

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const urlPath =
    '/announcements/' +
    (Array.isArray(params?.page) ? params.page.join('/') : params?.page || '');

  const announcementBar = await fetchOneEntry({
    apiKey: BUILDER_API_KEY,
    model,
    userAttributes: { urlPath },
  });

  return {
    props: { announcementBar },
    revalidate: 5,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await fetchEntries({
    apiKey: BUILDER_API_KEY,
    model,
    fields: 'data.url',
    options: { noTargeting: true },
  });

  return {
    // get all the paths for the pages
    paths: pages.map((page) => `${page.data?.url}`),
    fallback: 'blocking',
  };
};

export default function Page(props: {
  announcementBar: BuilderContent | null;
}) {
  const router = useRouter();

  const canShowContent =
    props.announcementBar ||
    isPreviewing(router.asPath) ||
    isEditing(router.asPath);

  return (
    <>
      <Head>
        <title>{props.announcementBar?.data?.title}</title>
      </Head>
      {canShowContent ? (
        <Content
          content={props.announcementBar}
          model={model}
          apiKey={BUILDER_API_KEY}
        />
      ) : (
        <div>Announcement Bar not Found</div>
      )}
      {/* Your content coming from your app (or also Builder) */}
      <div>The rest of your page goes here</div>
    </>
  );
}
