import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';
import React from 'react';
import { BuilderComponent, builder, useIsPreviewing, Builder } from '@builder.io/react';

/*
  Initialize the Builder SDK with your organization's API Key
  The API Key can be found on: https://builder.io/account/settings
*/
builder.init('<<<YOUR_API_KEY>>>');

export async function getStaticProps({ params }) {
  /*
    Fetch the first page from Builder that matches the current URL.
    The `userAttributes` field is used for targeting content,
    learn more here: https://www.builder.io/c/docs/targeting-with-builder
  */
  const page = await builder
    .get('<<<MODEL_NAME>>>', {
      userAttributes: {
        urlPath: '/' + (params?.page?.join('/') || ''),
      },
    })
    .toPromise();

  return {
    props: {
      page: page || null,
    },
    revalidate: 5,
  };
}

export async function getStaticPaths() {
  /*
    Fetch all published pages for the current model.
    Using the `fields` option will limit the size of the response
    and only return the `data.url` field from the matching pages.
  */
  const pages = await builder.getAll('<<<MODEL_NAME>>>', {
    fields: 'data.url', // only request the `data.url` field
    options: { noTargeting: true },
    limit: 0,
  });

  return {
    paths: pages.map(page => `${page.data?.url}`),
    fallback: true,
  };
}

export default function Page({ page }) {
  const router = useRouter();
  /*
    This flag indicates if you are viewing the page in the Builder editor.
  */
  const isPreviewing = useIsPreviewing();

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  /*
    Add your error page here. This will happen if there are no matching
    content entries published in Builder.
  */
  if (!page && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <>
      <Head>
        {/* Add any relevant SEO metadata or open graph tags here */}
        <title>{page?.data.title}</title>
        <meta name="description" content={page?.data.descripton} />
      </Head>
      {/* Render the Builder page */}
      <BuilderComponent model="page" content={page} />
    </>
  );
}

/* 
  This is an example of registering a custom component to be used in Builder.io. 
  You would typically do this in the file where the component is defined.
*/

const MyCustomComponent = props => (
  <div>
    <h1>{props.title}</h1>
    <p>{props.description}</p>
  </div>
);

/*
  This is a simple example of a custom component, you can view more complex input types here:
  https://www.builder.io/c/docs/custom-react-components#input-types
*/
Builder.registerComponent(MyCustomComponent, {
  name: 'ExampleCustomComponent',
  inputs: [
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string' },
  ],
});
