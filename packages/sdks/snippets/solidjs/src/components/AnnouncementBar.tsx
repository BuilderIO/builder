/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/components/AnnouncementBar.tsx
 */
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-solid';
import { createEffect, createSignal } from 'solid-js';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL = 'announcement-bar';

function AnnouncementBar() {
  const [content, setContent] = createSignal<BuilderContent | null>(null);

  createEffect(() => {
    fetchOneEntry({
      model: MODEL,
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then((data: any) => {
      setContent(data);
    });
  });

  return (
    <>
      {content() && (
        <Content content={content()} apiKey={BUILDER_API_KEY} model={MODEL} />
      )}

      {/* Your content coming from your app (or also Builder) */}
      <div>The rest of your page goes here</div>
    </>
  );
}

export default AnnouncementBar;
