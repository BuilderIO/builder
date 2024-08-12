/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/pages/announcements/[...page].tsx
 */
import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
  type BuilderContent,
} from '@builder.io/sdk-react';
import type { GetServerSideProps } from 'next';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'announcement-bar';

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const urlPath =
    '/announcements/' +
    (Array.isArray(params?.page) ? params.page.join('/') : params?.page || '');

  const announcementBar = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: BUILDER_API_KEY,
    userAttributes: { urlPath },
    options: getBuilderSearchParams(new URLSearchParams(query as any)),
  });

  return {
    props: { content: announcementBar },
  };
};

const AnnouncementBarPage = (props: { content: BuilderContent | null }) => {
  return (
    <>
      {/* Announcement Bar goes here */}
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

