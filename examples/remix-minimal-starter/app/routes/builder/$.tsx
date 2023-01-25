import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import builderConfig from '../../../builderConfig.json';

builder.init(builderConfig.apiKey);

export const loader: LoaderFunction = async ({ params }) => {
  const page = await builder
    .get('page', {
      options: { includeUnpublished: true },
      userAttributes: {
        urlPath: `/${params['*']}`,
      },
    })
    .toPromise();

  return { page };
};

export default function Page(props: any) {
  /* @ts-expect-error see https://github.com/BuilderIO/builder/issues/1387 */
  const { page }: BuilderContent = useLoaderData<BuilderContent>();
  const isPreviewingInBuilder = useIsPreviewing();
  const show404 = !page && !isPreviewingInBuilder;

  if (show404) {
    return <h1>404 not found (customize your 404 here)</h1>;
  }

  return (
    <div>
      <h3>Welcome to the Builder side of your Remix app ;)</h3>
      <BuilderComponent model="page" content={page} />
    </div>
  );
}
