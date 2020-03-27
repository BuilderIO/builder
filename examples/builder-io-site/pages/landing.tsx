import React from 'react';
import { builder, BuilderComponent } from '@builder.io/react';
import Error from './_error';
import Head from 'next/head';

builder.init('YJIGb4i01jvw0SRdL5Bt');

const defaultDescription =
  'Builder is the first and only headless CMS with full visual drag and drop editing';
const defaultTitle = 'Builder: Drag and Drop Page Building for Any Site';

function Landing({ builderPage }: any /* TODO: types */) {
  return (
    <div>
      <Head>
        <title>
          {(builderPage && (builderPage.data.pageTitle || builderPage.data.title)) || defaultTitle}
        </title>
        <meta
          name="description"
          content={
            (builderPage && (builderPage.data.pageDescription || builderPage.data.description)) ||
            defaultDescription
          }
        />
      </Head>

      {builderPage ? <BuilderComponent name="content-page" content={builderPage} /> : <Error />}
    </div>
  );
}

Landing.getInitialProps = async ({ res, req, asPath }: any /* TODO: types */) => {
  const path = asPath.split('?')[0];
  builder.setUserAttributes({ urlPath: path });
  const page = await builder.get('content-page', { req, res }).promise();
  if (!page) {
    res.status = 404;
  }
  // If there is a Builder page for this URL, this will be an object, otherwise it'll be null
  return { builderPage: page };
};

export default Landing;
