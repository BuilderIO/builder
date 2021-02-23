import React from 'react';
import { builder, BuilderComponent, Builder } from '@builder.io/react';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import Error from './_error';
import { renderLink } from '../functions/render-link';
import { defaultDescription, defaultTitle } from '../constants/seo-tags';
import { getBuilderStaticPaths } from '../functions/get-builder-static-paths';
import { getBuilderStaticProps } from '../functions/get-builder-static-props';
import { USE_CODEGEN } from '@/constants/use-codegen';

builder.init('YJIGb4i01jvw0SRdL5Bt');

if (USE_CODEGEN) {
  builder.env = process.env.NODE_ENV === 'development' ? 'dev' : 'test';
}

function LandingPage({ builderPage }: any /* TODO: types */) {
  const title = `${
    (builderPage && (builderPage.data.pageTitle || builderPage.data.title)) ||
    defaultTitle
  } | Builder.io`;
  return (
    <div>
      <Head>
        {!builderPage && <meta key="robots" name="robots" content="noindex" />}
        <title>{title}</title>
        <meta key="og:title" property="og:title" content={title} />
        <meta key="twitter:title" property="twitter:title" content={title} />
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

      {builderPage || Builder.isEditing || Builder.isPreviewing ? (
        <BuilderComponent
          codegen={USE_CODEGEN}
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
