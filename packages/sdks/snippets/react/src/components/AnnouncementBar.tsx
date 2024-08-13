/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/components/AnnouncementBar.tsx
 */
import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
  type BuilderContent,
} from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'announcement-bar';

export default function AnnouncementBar() {
  const [content, setContent] = useState<BuilderContent | null>(null);

  useEffect(() => {
    fetchOneEntry({
      model: MODEL_NAME,
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: window.location.pathname,
      },
      options: getBuilderSearchParams(new URL(location.href).searchParams),
    })
      .then((content) => {
        if (content) {
          setContent(content);
        }
      })
      .catch((err) => {
        console.log('Oops: ', err);
      });
  }, []);

  return (
    <>
      {content && (
        <Content
          content={content}
          model={MODEL_NAME}
          apiKey={BUILDER_API_KEY}
        />
      )}

      {/* content coming from your app (or also Builder) */}
      <div>The rest of your page goes here</div>
    </>
  );
}
