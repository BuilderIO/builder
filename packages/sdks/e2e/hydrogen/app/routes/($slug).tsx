import {Content} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {getProps} from '@sdk/tests';

export const loader: LoaderFunction = async ({params}) => {
  try {
    // const {initializeNodeRuntime} = await import(
    //   '@builder.io/sdk-react/node/init'
    // );

    // console.log('intializing node runtime');

    // await initializeNodeRuntime();
    return await getProps({pathname: `/${params.slug || ''}`});
  } catch (e) {
    console.error(e);
    return {content: null};
  }
};

export default function Page() {
  const builderProps = useLoaderData<ReturnType<typeof getProps>>();

  return builderProps?.content ? (
    <Content {...builderProps} />
  ) : (
    <div>Content Not Found.</div>
  );
}
