import React from 'react';
import Head from 'next/head';
import { builder, BuilderComponent } from '@builder.io/react';
// Allow interactive widgets in the editor (importing registers the react components)
import '@builder.io/widgets';
import Nav from '../components/nav';

const BUILDER_API_KEY = 'YOUR_KEY';
builder.init(BUILDER_API_KEY);

const getServerSideProps = async ({ req, res }) => {
  // Get the upcoming route full location path and set that for Builder.io page targeting
  const [path] = req.url.split('?');

  // 'page' is the model name for your pages. If you made a new model with a different name,
  // such as 'my-page', use `builder.get('my-page', ...)
  const page = await builder.get('page', { req, res, userAttributes: { urlPath: path } }).promise();

  if (!page) {
    res.statusCode = 404;
  }

  return {
    props: {
      builderPage: page ? { ...page, testVariationName: page.testVariationName || null } : null,
    },
  };
};

const CatchallPage = ({ builderPage: page }) => (
  <>
    <Nav />
    <div>
      {page ? (
        <>
          <Head>
            <title>{page.data.title}</title>
          </Head>
          <BuilderComponent model="page" content={page} />
        </>
      ) : (
        <div>Page not found!</div>
      )}
    </div>
  </>
);

export default CatchallPage;
export { getServerSideProps };
