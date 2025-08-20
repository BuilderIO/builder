/**
 * Quickstart snippet
 * snippets/hydrogen/app/components/app.tsx
 */

import {Content, fetchOneEntry, isPreviewing} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {useNonce} from '@shopify/hydrogen';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const model = 'page';

export const builderLoader: LoaderFunction = async ({params, request}) => {
  try {
    const pathname = `/${params['*'] || ''}`;
    const url = new URL(request.url);

    const content = await fetchOneEntry({
      model,
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: pathname,
      },
    });
    return {content, model, searchParams: Object.fromEntries(url.searchParams)};
  } catch (e) {
    console.error(e);
    return {content: null};
  }
};

export default function BuilderPage() {
  const {content, model, searchParams} = useLoaderData<{
    content: any;
    model: string;
    searchParams: Record<string, string>;
  }>();
  const nonce = useNonce();

  const canShowContent = content || isPreviewing(searchParams);

  return (
    <div>
      {canShowContent ? (
        <Content
          model={model}
          apiKey={BUILDER_API_KEY}
          content={content}
          nonce={nonce}
        />
      ) : (
        <div>404</div>
      )}
    </div>
  );
}
