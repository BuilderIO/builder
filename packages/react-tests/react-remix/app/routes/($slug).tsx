import { Links, Meta, Scripts, useCatch, useLoaderData, useParams } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { BuilderComponent, builder, Builder } from '@builder.io/react';
import { getAPIKey, getProps } from '@builder.io/sdks-e2e-tests';
import { useEffect } from 'react';
import { getCustomComponents } from '@builder.io/sdks-tests-custom-components/output/react/src/index';

builder.init(getAPIKey());

export const loader: LoaderFunction = async ({ params }) => {
  const path = `/${params.slug || ''}`;
  const props = { ...getProps(path), customComponents: getCustomComponents(path) };
  return { props: props };
};

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
  const props = useLoaderData<
    ReturnType<typeof getProps> & { customComponents: ReturnType<typeof getCustomComponents> }
  >();
  const params = useParams();

  props.customComponents.forEach(({ component, ...info }) => {
    Builder.registerComponent(component, info);
  });

  // only enable tracking if we're not in the `/can-track-false` test route
  useEffect(() => {
    if (!params.slug?.includes('can-track-false')) {
      builder.canTrack = true;
    }
  }, []);

  return props?.content ? <BuilderComponent {...props} /> : <div>Content Not Found.</div>;
}
