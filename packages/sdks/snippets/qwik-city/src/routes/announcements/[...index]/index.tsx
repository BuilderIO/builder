/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/routes/announcements/[...index]/index.tsx
 */
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-qwik';

export const BUILDER_PUBLIC_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
export const BUILDER_MODEL = 'announcement-bar';

export const useBuilderContent = routeLoader$(async ({ url }) => {
  const builderContent = await fetchOneEntry({
    model: BUILDER_MODEL,
    apiKey: BUILDER_PUBLIC_API_KEY,
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: {
      urlPath: url.pathname,
    },
  });

  return builderContent;
});

export default component$(() => {
  const content = useBuilderContent();
  return (
    <>
      {content.value ? (
        <Content
          model={BUILDER_MODEL}
          content={content.value}
          apiKey={BUILDER_PUBLIC_API_KEY}
        />
      ) : (
        <div>Announcement Bar not Found</div>
      )}
      {/* Your content coming from your app (or also Builder) */}
      <div>The rest of your page goes here</div>
    </>
  );
});
