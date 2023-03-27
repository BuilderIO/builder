import { Links, Meta, Scripts, useCatch, useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { BuilderComponent, builder } from '@builder.io/react';
import { getAPIKey, getProps } from '@builder.io/sdks-e2e-tests';

builder.init(getAPIKey());

export const loader: LoaderFunction = async ({ params }) => getProps(`/${params.slug || ''}`);

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html>
      <head>
        <title>Error: {caught.status}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h3>
          Error: {caught.status} - {caught.statusText}
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

export default function Page() {
  const props = useLoaderData<ReturnType<typeof getProps>>();

  return props?.content ? <BuilderComponent {...props} /> : <div>Content Not Found.</div>;
}
