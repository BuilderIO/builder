import {
  Links,
  Meta,
  Scripts,
  useCatch,
  useLoaderData,
} from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-react';
import { getProps } from '@builder.io/sdks-e2e-tests';

export const loader: LoaderFunction = async ({ params }) =>
  await getProps(`/${params.slug || ''}`);

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
        <Scripts />
      </body>
    </html>
  );
}

export default function Page() {
  const props = useLoaderData<ReturnType<typeof getProps>>();

  return props?.content ? (
    <RenderContent {...props} />
  ) : (
    <div>Content Not Found.</div>
  );
}
