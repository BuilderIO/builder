/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * app/announcements/[...slug]/page.tsx
 */
import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
  isEditing,
  isPreviewing,
} from '@builder.io/sdk-react';

interface PageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
const model = 'announcement-bar';

export default async function Page(props: PageProps) {
  const urlPath = '/announcements/' + (props.params?.slug?.join('/') || '');

  const announcementBar = await fetchOneEntry({
    apiKey,
    model,
    options: getBuilderSearchParams(props.searchParams),
    userAttributes: { urlPath },
  });

  const canShowAnnouncementBar =
    announcementBar ||
    isPreviewing(props.searchParams) ||
    isEditing(props.searchParams);

  return (
    <>
      {canShowAnnouncementBar && (
        <Content content={announcementBar} apiKey={apiKey} model={model} />
      )}
      {/* Your content coming from your app (or also Builder) */}
      <div>The rest of your page goes here</div>
    </>
  );
}
