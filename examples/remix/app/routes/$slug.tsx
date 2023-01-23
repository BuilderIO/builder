import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { BuilderContent} from "@builder.io/sdk";
import {builder, BuilderComponent, Builder} from "@builder.io/react";
import Counter from "~/components/Counter";

builder.init("8335d18816304315aebeb7e9532281ce")
 
Builder.registerComponent(Counter, {
  name : 'Counter'
})

export const loader:LoaderFunction = async ({params}) => {
  /* 
    loader function serialises data using json, if you encounter an issue stating 
    content from builder sdk cannot be serialised, try using libraries like 
    remix-superjson which extends the capabilities of standard json and allows you 
    to serialise more types, if the issue still does not solve try creating an issue 
    in the builder react sdk on github  
  */
  const {slug} = params
  const page = await builder.get("page", {
          options: { includeUnpublished: true },
          userAttributes: { urlPath: '/' + slug },
        }).promise()
  if (!page) {
    throw new Response("Not Found", {
      status: 404,
    });
  }
  return json(page)
};

export default function Page() {
  const page = useLoaderData() as unknown as BuilderContent // this is a workaround to set the page type as BuilderContent, a known issue with remix - https://github.com/remix-run/remix/issues/3931
  return (
    <div>
      <BuilderComponent model="page" content={page} />
    </div>
  );
}
