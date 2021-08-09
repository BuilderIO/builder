import { builder, BuilderComponent, Image } from '@builder.io/react';
import { GetStaticProps, GetStaticPropsContext } from 'next';
import Head from 'next/head';
import React from 'react';
import AtvImg from '../components/atv-image';
import { TextLink } from '../components/text-link';
import {
  largeBreakpointMediaQuery,
  mediumBreakpointMediaQuery,
  xLargeBreakpointMediaQuery,
} from '../constants/breakpoints';
import { footerBuilderEntryId } from '../constants/footer-builder-entry-id';
import { RenderLink, renderLink } from '../functions/render-link';

builder.init('YJIGb4i01jvw0SRdL5Bt');
const articlesPerPage = 30;

function Blog({ articles, header, footer, page }: any /* TODO: types */) {
  const cellWidth = 350;
  const largeCellWidth = 400;
  const cellSpace = 20;
  const cellAspectRatio = 3 / 4;
  const cellImageHeight = cellWidth * cellAspectRatio;
  const cellTitleHeight = 60;

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontSize: 16,
        padding: '0 20px',
        backgroundColor: '#f5f4ed',

        code: {
          fontSize: 14,
          lineHeight: '0.9em',
        },
      }}
    >
      <Head>
        <title>Builder.io Blog</title>
        <meta
          name="description"
          content="Best practices for high performing ecommerce"
        />
      </Head>
      <BuilderComponent
        renderLink={renderLink}
        name="docs-header"
        content={header}
      />
      <div
        css={{
          padding: 50,
          width: '100%',
          maxWidth: 1400,
          margin: '0 auto',
          textAlign: 'center',
          [largeBreakpointMediaQuery]: {
            padding: '20px 0 0 0',
            maxWidth: 1210,
          },
        }}
      >
        {!articles.length ? (
          <div
            css={{
              textAlign: 'center',
              padding: 50,
              marginTop: 50,
              marginBottom: 50,
            }}
          >
            <div>
              No articles found for this page.{' '}
              <TextLink href="/blog">Back to the blog</TextLink>
            </div>
            <div css={{ marginTop: 30 }}>
              <img
                css={{
                  maxWidth: '80vw',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow:
                    '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
                }}
                src="https://media.giphy.com/media/RHzqdZJztOu7S/giphy.gif"
              />
            </div>
          </div>
        ) : (
          articles.slice(0, articlesPerPage).map((item: any, index: number) => {
            const makeBig = index === 0;
            return (
              <RenderLink
                css={{
                  cursor: 'pointer',
                  display: 'inline-block',
                  float: 'left',
                  '&:hover': {
                    zIndex: 10,
                  },
                  [largeBreakpointMediaQuery]: {
                    float: 'none',
                    margin: 'auto',
                  },
                }}
                key={item.id}
                href={`/blog/${item.data.handle}`}
              >
                <AtvImg
                  css={{
                    width: makeBig
                      ? largeCellWidth * 2 + cellSpace
                      : largeCellWidth,
                    maxWidth: 'calc(100vw - 40px)',
                    marginRight: cellSpace,
                    marginBottom: cellSpace,
                    [xLargeBreakpointMediaQuery]: {
                      width: makeBig ? cellWidth * 2 + cellSpace : cellWidth,
                    },
                    [largeBreakpointMediaQuery]: {
                      width: cellWidth,
                    },
                    [mediumBreakpointMediaQuery]: {
                      marginRight: 0,
                    },
                  }}
                  widthMultiple={makeBig ? cellWidth / 2 : cellWidth}
                  heightMultiple={makeBig ? cellWidth / 2 : cellWidth}
                >
                  <div
                    css={{
                      display: 'block',
                      height: cellImageHeight,
                      position: 'relative',
                      overflow: 'hidden',

                      ...(makeBig && {
                        height:
                          cellImageHeight * 2 + cellSpace + cellTitleHeight - 1,
                      }),
                      [xLargeBreakpointMediaQuery]: {
                        height: cellImageHeight,
                        ...(makeBig && {
                          height:
                            cellImageHeight * 2 +
                            cellSpace +
                            cellTitleHeight -
                            1,
                        }),
                      },
                      [largeBreakpointMediaQuery]: {
                        height: cellImageHeight,
                      },
                    }}
                  >
                    <Image
                      aspectRatio={0.5}
                      backgroundSize="cover"
                      image={item.data.image}
                      lazy
                    />
                  </div>
                  <div
                    css={{
                      padding: `0 ${makeBig ? 17 : 20}`,
                      textAlign: 'center',
                      boxShadow:
                        '0px 2px 2px rgba(0, 0, 0, 0.04), 0px 1px 11px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div
                      css={{
                        fontSize: makeBig ? 25 : 20,
                        height: makeBig ? 120 : 90,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        justifyContent: 'center',
                        [largeBreakpointMediaQuery]: { fontSize: 20 },
                      }}
                    >
                      <div css={{ margin: 'auto 5px' }}>{item.data.title}</div>
                    </div>
                  </div>
                </AtvImg>
              </RenderLink>
            );
          })
        )}
      </div>
      {(Boolean(page) || articles.length > articlesPerPage) && (
        <div css={{ padding: 20, width: 300, margin: 'auto', display: 'flex' }}>
          {Boolean(page) && (
            <TextLink
              css={{
                color: '#777',
              }}
              href={`/blog${page <= 1 ? '' : `?page=${page - 1}`}`}
            >
              ‹ Previous page
            </TextLink>
          )}
          {articles.length > articlesPerPage && (
            <TextLink
              css={{
                color: '#777',
                marginLeft: 'auto',
              }}
              href={`/blog?page=${page + 1}`}
            >
              Next page ›
            </TextLink>
          )}
        </div>
      )}
      <div css={{ maxWidth: 1200, width: '100%', margin: '40px auto 0' }}>
        <BuilderComponent name="symbol" content={footer} />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return { props: await getContent(context), revalidate: true };
};

const getContent = async (context: GetStaticPropsContext) => {
  // TODO: support pages using like @page or something bg next static can't do query params
  const page = 0;
  const attributes = { device: '_', urlPath: '/blog ' } as any;

  const [articles, header, footer] = await Promise.all([
    builder.getAll('blog-article', {
      key: `blog-articles:all:${page}`,
      fields: 'data.image,data.handle,data.title',
      limit: articlesPerPage + 1, // Fetch an extra to know if there is another page
      offset: page * articlesPerPage,
      userAttributes: attributes,
      options: {
        noTargeting: true,
      },
      query: {
        'data.hideFromList': { $ne: true },
      },
    }),
    builder.get('docs-header', { userAttributes: attributes }).promise(),
    builder
      .get('symbol', {
        userAttributes: { ...attributes },
        entry: footerBuilderEntryId,
      })
      .promise(),
  ]);

  return { articles, header, footer, page };
};

export default Blog;
