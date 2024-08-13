/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/pages/announcements/[...page].tsx
 */
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-react';
import type { GetStaticPaths, GetStaticProps } from 'next';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'announcement-bar';

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const urlPath =
    '/announcements/' +
    (Array.isArray(params?.page) ? params.page.join('/') : params?.page || '');

  const announcementBar = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: BUILDER_API_KEY,
    userAttributes: { urlPath },
  });

  return {
    props: { content: announcementBar },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

const AnnouncementBarPage = (props: { content: BuilderContent | null }) => {
  return (
    <>
      {props.content && (
        <Content
          content={props.content}
          model={MODEL_NAME}
          apiKey={BUILDER_API_KEY}
        />
      )}

      {/* content coming from your app (or also Builder) */}
      <div>The rest of your page goes here</div>
    </>
  );
};

export default AnnouncementBarPage;
