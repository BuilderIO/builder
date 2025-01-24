import { Links, Meta, Scripts, useCatch, useLoaderData, useParams } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { BuilderComponent, builder } from '@builder.io/react';
import { getAPIKey, getProps } from '@sdk/tests';
import { useEffect } from 'react';

import '@builder.io/widgets';

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

  if (props?.apiEndpoint) {
    builder.apiEndpoint = props.apiEndpoint;
    delete props.apiEndpoint;
  }

  useEffect(() => {
    if (
      window.location.pathname.includes('get-query') ||
      window.location.pathname.includes('get-content')
    ) {
      builder
        .get('', {
          ...props,
          ...props['options'],
        })
        .promise()
        .then();
    }
  }, []);

  // only enable tracking if we're not in the `/can-track-false` and `symbol-tracking` test route
  useEffect(() => {
    if (!params.slug?.includes('can-track-false') && !params.slug?.includes('symbol-tracking')) {
      builder.canTrack = true;
    }
  }, [params.slug]);

  return props?.content ? <BuilderComponent {...props} /> : <div>Content Not Found.</div>;
}
