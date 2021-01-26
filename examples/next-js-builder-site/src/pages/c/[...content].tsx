import React from 'react';
import { builder, BuilderComponent } from '@builder.io/react';
import Head from 'next/head';
import { renderLink } from '../../functions/render-link';
import { defaultTitle, defaultDescription } from '../../constants/seo-tags';
import { GetStaticProps } from 'next';

builder.init('YJIGb4i01jvw0SRdL5Bt');

const verticalBreakpoint = '@media (max-width: 800px)';

function Content({ builderPage, docsHeader }: any /* TODO: types */) {
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

      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 16,
          padding: '0 20px',
        }}
      >
        <header
          css={{
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            borderBottom: '1px solid #ddd',
          }}
        >
          <BuilderComponent
            renderLink={renderLink}
            name="docs-header"
            content={docsHeader}
          />
        </header>

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
                backgroundColor: 'white',
                borderRadius: 0,
                [verticalBreakpoint]: {
                  padding: 20,
                  margin: '10px 0',
                  borderRadius: 4,
                },
              }}
            >
              {builderPage ? (
                <BuilderComponent
                  renderLink={renderLink}
                  key={builderPage.id}
                  name="content-page"
                  content={builderPage}
                />
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
                      href="/c/docs/intro"
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

export const getStaticPaths = async () => {
  const results = await builder.getAll('content-page', {
    key: 'content-pages:all',
    fields: 'data.url',
    limit: 200,
    options: {
      noTargeting: true,
    },
  });

  const paths = results
    .filter((item) => Boolean(item.data?.url?.startsWith('/c/')))
    .map((item) => ({
      params: {
        content: (item.data?.url?.replace('/c/', '') || '').split('/'),
      },
    }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  // Don't target on url and device for better cache efficiency
  const targeting = { urlPath: '_', device: '_' } as any;
  const path = `/c/${(context.params?.content as string[])?.join('/') || ''}`;

  const [page, docsHeader] = await Promise.all([
    builder
      .get('content-page', {
        userAttributes: { ...targeting, urlPath: path },
      })
      .promise(),
    builder.get('docs-header', { userAttributes: targeting }).promise(),
  ]);

  // If there is a Builder page for this URL, this will be an object, otherwise it'll be null
  return { revalidate: 1, props: { builderPage: page || null, docsHeader } };
};

export default Content;
