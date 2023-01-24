import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { BuilderContent } from '@builder.io/sdk';
import { builder, BuilderComponent, Builder } from '@builder.io/react';
import Counter from '~/components/Counter';

// ENSURE YOU REPLACE THE API KEY BELOW WITH YOUR OWN
const BUILDER_API_KEY = '8335d18816304315aebeb7e9532281ce';
builder.init(BUILDER_API_KEY);

// Registering a component will make it appear in the custom-components in builder space
// https://www.builder.io/c/docs/custom-components-setup
Builder.registerComponent(Counter, {
  name: 'Counter',
});

export const loader: LoaderFunction = async ({ params }) => {
  // loader function serialises data using json, if you encounter an issue stating 
  // content from builder sdk cannot be serialised, try using libraries like 
  // remix-superjson which extends the capabilities of standard json and allows you 
  // to serialise more types, if the issue still does not solve try creating an issue 
  // in the builder react sdk on github  
  const { slug } = params;
  // fetching builder content for the current URL path
  const page = await builder
    .get('page', {
      options: { includeUnpublished: true },
      userAttributes: { urlPath: '/' + slug },
    })
    .promise();
  // If no page is found, return 
  // a 404 page from your code.
  if (!page) {
    throw new Response('Not Found', {
      status: 404,
    });
  }
  return json(page);
};

export default function Page() {
  // This hook returns the JSON parsed data from your route loader function
  const page = useLoaderData() as unknown as BuilderContent; // this is a workaround to set the page type as BuilderContent (from core builder/sdk), a known issue with remix - https://github.com/remix-run/remix/issues/3931
  return (
    <div>
      <BuilderComponent model="page" content={page} />
    </div>
  );
}
