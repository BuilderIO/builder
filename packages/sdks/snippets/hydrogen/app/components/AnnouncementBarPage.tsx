/**
 * Quickstart snippet
 * snippets/hydrogen/app/components/AnnouncementBarPage.tsx
 */

import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {useNonce} from '@shopify/hydrogen';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const model = 'announcement-bar';

export const announcementsLoader: LoaderFunction = async ({
  params,
  request,
}) => {
  try {
    const pathname = `/announcements/${params['*'] || ''}`;
    const url = new URL(request.url);

    const content = await fetchOneEntry({
      model,
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: pathname,
      },
      options: getBuilderSearchParams(url.searchParams),
    });

    return {content, model};
  } catch (e) {
    console.error(e);
    return {content: null};
  }
};

export default function AnnouncementBarPage() {
  const {content, model} = useLoaderData<{content: any; model: string}>();
  const nonce = useNonce();

  return (
    <div>
      {content && (
        <Content
          model={model}
          apiKey={BUILDER_API_KEY}
          content={content}
          nonce={nonce}
        />
      )}
      <div>The rest of your page goes here</div>
    </div>
  );
}
