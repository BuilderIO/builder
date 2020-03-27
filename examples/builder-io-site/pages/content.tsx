/**@jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { builder, BuilderComponent } from '@builder.io/react';
import Head from 'next/head';

builder.init('YJIGb4i01jvw0SRdL5Bt');

const defaultDescription =
  'Builder is the first and only headless CMS with full visual drag and drop editing';
const defaultTitle = 'Builder: Drag and Drop Page Building for Any Site';

const verticalBreakpoint = '@media (max-width: 800px)';

function Landing({ builderPage, docsHeader }: any /* TODO: types */) {
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

      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          fontSize: 16,
          padding: '0 20px',
          [verticalBreakpoint]: {
            overflowX: 'hidden',
            overflowY: 'auto',
            height: 'auto',
            padding: 0,
          },
        }}
      >
        <BuilderComponent name="docs-header" content={docsHeader} />
        <div
          css={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'stretch',
            overflow: 'hidden',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderTopRightRadius: 6,
            borderTopLeftRadius: 6,
            margin: '0 auto',
            width: '100%',
            height: '100%',
            maxWidth: 1400,
            background: 'white',
            boxShadow:
              '0px 3px 3px -2px rgba(0,0,0,0.1), 0px 3px 4px 0px rgba(0,0,0,0.07), 0px 1px 8px 0px rgba(0,0,0,0.06)',
          }}
        >
          <div
            css={{
              display: 'flex',
              flexGrow: 1,
              width: '100%',
              alignSelf: 'stretch',
            }}
          >
            <div
              css={{
                padding: '30px 50px 50px 50px',
                flexGrow: 1,
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                backgroundColor: 'white',
                borderRadius: 0,
                [verticalBreakpoint]: {
                  overflow: 'visible',
                  overflowY: 'visible',
                  height: 'auto',
                  padding: 20,
                  margin: '10px 0',
                  borderRadius: 4,
                },
              }}
            >
              {builderPage ? (
                <BuilderComponent key={builderPage.id} name="content-page" content={builderPage} />
              ) : (
                <>
                  <h3 css={{ marginTop: 20 }}>Doc not found!</h3>
                  <p
                    css={{
                      marginTop: 20,
                    }}
                  >
                    Try choosing another doc from the nav bar or{' '}
                    <a
                      css={{
                        color: 'steelblue',
                      }}
                      href="/c/docs/intro?v=2"
                    >
                      go to our docs homepage
                    </a>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Landing.getInitialProps = async ({ res, req, asPath }: any /* TODO: types */) => {
  const path = asPath.split('?')[0];
  builder.setUserAttributes({ urlPath: path });
  const [page, docsHeader] = await Promise.all([
    builder.get('content-page', { req, res }).promise(),
    builder.get('docs-header', { req, res }).promise(),
  ]);
  if (!page) {
    res.status = 404;
  }
  // If there is a Builder page for this URL, this will be an object, otherwise it'll be null
  return { builderPage: page, docsHeader };
};

export default Landing;
