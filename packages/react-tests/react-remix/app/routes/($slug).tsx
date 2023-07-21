import { Links, Meta, Scripts, useCatch, useLoaderData, useParams } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { BuilderComponent, builder } from '@builder.io/react';
import { getAPIKey, getProps } from '@e2e/tests';
import { useEffect } from 'react';

builder.init(getAPIKey());

export const loader: LoaderFunction = async ({ params }) =>
  await getProps({ pathname: `/${params.slug || ''}` });

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
  const params = useParams();

  if (props?.apiVersion) {
    builder.apiVersion = props?.apiVersion;
  }

  // only enable tracking if we're not in the `/can-track-false` test route
  useEffect(() => {
    if (!params.slug?.includes('can-track-false')) {
      builder.canTrack = true;
    }
  }, []);

  return props?.content ? <BuilderComponent {...props} /> : <div>Content Not Found.</div>;
}
