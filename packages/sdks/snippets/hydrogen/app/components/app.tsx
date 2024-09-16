import {Content, fetchOneEntry} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {getProps} from '@sdk/tests';
import {useNonce} from '@shopify/hydrogen';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const builderLoader: LoaderFunction = async ({params}) => {
  try {
    const urlPath =
      '/' +
      (Array.isArray(params?.page)
        ? params.page.join('/')
        : params?.page || '');

    return await fetchOneEntry({
      apiKey: BUILDER_API_KEY,
      model: 'page',
      userAttributes: {urlPath},
    });
  } catch (e) {
    console.error(e);
    return {content: null};
  }
};

export default function BuilderPage() {
  const builderProps = useLoaderData<ReturnType<typeof getProps>>();

  const nonce = useNonce();

  return builderProps?.content ? (
    <Content nonce={nonce} {...builderProps} />
  ) : (
    <div>Content Not Found.</div>
  );
}
