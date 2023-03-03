import { BuilderComponent, builder } from '@builder.io/react';
import type { BuilderContent } from '@builder.io/sdk';
import { Builder } from '@builder.io/sdk';
import { Links, Meta, Scripts, useCatch, useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import builderConfig from '../../builderConfig.json';

builder.init(builderConfig.apiKey);

export const loader: LoaderFunction = async ({ params }) => {
  const page = await builder
    .get('page', {
      userAttributes: {
        urlPath: `/${params['*']}`,
      },
    })
    .toPromise();

  const isPreviewing = Builder.isEditing || Builder.isPreviewing;

  if (!page && !isPreviewing) {
    throw new Response('Page Not Found', {
      status: 404,
      statusText:
        "We couldn't find this page, please check your url path and if the page is published on Builder.io.",
    });
  }

  return page;
};

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h3>
          <p>
            {caught.status} {caught.statusText}
          </p>
        </h3>
        <p>
          Make sure you have this page published on{' '}
          <a target="_blank" href="https://builder.io/content" rel="noreferrer">
            Builder.io
          </a>
        </p>
        <Scripts />
      </body>
    </html>
  );
}

// this gives full compatibility to BuilderContent type and Remix starter
// See: https://github.com/BuilderIO/builder/issues/1387#issuecomment-1397442797
type BuilderContentRemix = Omit<BuilderContent, 'variations' | 'data'>;

export default function Page() {
  const page: BuilderContentRemix = useLoaderData<BuilderContentRemix>();

  return (
    <div>
      <h3>Welcome to the Builder.io + Remix starter</h3>
      <BuilderComponent model="page" content={page} />
    </div>
  );
}
