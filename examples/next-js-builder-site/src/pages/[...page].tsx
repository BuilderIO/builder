import React from 'react';
import { builder, BuilderComponent } from '@builder.io/react';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import Error from './_error';
import { renderLink } from '../functions/render-link';
import { defaultDescription, defaultTitle } from '../constants/seo-tags';
import { getBuilderStaticPaths } from '../functions/get-builder-static-paths';
import { getBuilderStaticProps } from '../functions/get-builder-static-props';

builder.init('YJIGb4i01jvw0SRdL5Bt');

function LandingPage({ builderPage }: any /* TODO: types */) {
  return (
    <div>
      <Head>
        <title>
          {(builderPage &&
            (builderPage.data.pageTitle || builderPage.data.title)) ||
            defaultTitle}{' '}
          | Builder.io
        </title>
        <meta
          name="description"
          content={
            (builderPage &&
              (builderPage.data.pageDescription ||
                builderPage.data.description)) ||
            defaultDescription
          }
        />
      </Head>

      {builderPage ? (
        <BuilderComponent
          renderLink={renderLink}
          name="content-page"
          content={builderPage}
        />
      ) : (
        <>
          <Head>
            <meta name="robots" content="noindex" />
          </Head>

          <Error status={404} />
        </>
      )}
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return getBuilderStaticPaths('content-page');
};

export const getStaticProps: GetStaticProps = async (context) => {
  return getBuilderStaticProps('content-page', context);
};

export default LandingPage;
