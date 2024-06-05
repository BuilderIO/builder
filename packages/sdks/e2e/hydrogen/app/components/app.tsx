import {Content} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {getProps} from '@sdk/tests';

export const builderLoader: LoaderFunction = async ({params}) => {
  try {
    const pathname = `/${params['*'] || ''}`;
    return await getProps({pathname});
  } catch (e) {
    console.error(e);
    return {content: null};
  }
};

export default function BuilderPage() {
  const builderProps = useLoaderData<ReturnType<typeof getProps>>();

  return builderProps?.content ? (
    <Content {...builderProps} />
  ) : (
    <div>Content Not Found.</div>
  );
}
