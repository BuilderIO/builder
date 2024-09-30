/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * snippets/gen1-remix/app/routes/announcements.$announcement.tsx
 */
import { BuilderComponent, builder } from '@builder.io/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const announcementBar = await builder
    .get('announcement-bar', {
      userAttributes: {
        urlPath: `/announcements/${params.slug ? params.slug : ''}`,
      },
    })
    .toPromise();

  const isPreviewing = new URL(request.url).searchParams.has('builder.preview');

  if (!announcementBar && !isPreviewing) {
    return {
      announcementBar: null,
    };
  }

  return {
    announcementBar,
  };
};

export default function Page() {
  const { announcementBar } = useLoaderData<typeof loader>();

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
