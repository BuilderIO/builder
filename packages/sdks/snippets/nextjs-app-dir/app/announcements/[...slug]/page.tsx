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
} from '@builder.io/sdk-react-nextjs';

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

  const content = await fetchOneEntry({
    apiKey,
    model,
    options: getBuilderSearchParams(props.searchParams),
    userAttributes: { urlPath },
  });

  const canShowContent =
    content ||
    isPreviewing(props.searchParams) ||
    isEditing(props.searchParams);

  return (
    <>
      {/* Your header coming from Builder */}
      {canShowContent ? (
        <Content content={content} apiKey={apiKey} model={model} />
      ) : (
        <div>Announcement Bar not Found</div>
      )}
      {/* Your content coming from your app (or also Builder) */}
      <div>The rest of your page goes here</div>
    </>
  );
}
