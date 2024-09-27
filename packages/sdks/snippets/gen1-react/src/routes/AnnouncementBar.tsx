/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/routes/AnnouncementBar.tsx
 */
import { BuilderComponent, builder } from '@builder.io/react';
import { useEffect, useState } from 'react';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

const MODEL_NAME = 'announcement-bar';

export default function AnnouncementBar() {
  const [announcementBar, setAnnouncementBar] = useState();

  useEffect(() => {
    builder
      .get(MODEL_NAME, {
        url: window.location.pathname,
      })
      .promise()
      .then((announcementBar) => {
        setAnnouncementBar(announcementBar);
      });
  }, []);

  return (
    <>
      {/* Render the Builder announcement bar */}
      {announcementBar && (
        <BuilderComponent model={MODEL_NAME} content={announcementBar} />
      )}
      {/* content coming from your app (or also Builder) */}
      <div>The rest of your page goes here</div>
    </>
  );
}
