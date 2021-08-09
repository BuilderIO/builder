import {
  builder,
  BuilderComponent,
  BuilderContent,
  Image,
} from '@builder.io/react';
import React from 'react';
import Head from 'next/head';
import { renderLink, RenderLink } from '../../functions/render-link';
import { TextLink } from '../../components/text-link';
import { theme } from '../../constants/theme';
import { mediumBreakpointMediaQuery } from '../../constants/breakpoints';
import { ReadProgress } from '../../components/read-progress';
import AtvImg from '../../components/atv-image';
import { footerBuilderEntryId } from '../../constants/footer-builder-entry-id';
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';

builder.init('YJIGb4i01jvw0SRdL5Bt');

function BlogArticle(
  { article, header, articles, footer, isEditing }: any /* TODO: types */,
) {
  const cellWidth = 350;
  const cellSpace = 20;
  const cellAspectRatio = 3 / 4;
  const cellImageHeight = cellWidth * cellAspectRatio;

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f4ed',
        fontSize: 16,
        code: {
          fontSize: 14,
          lineHeight: '0.9em',
        },
      }}
    >
      {header && (
        <BuilderComponent
          renderLink={renderLink}
          name="docs-header"
          content={header}
        />
      )}
      {!article && !isEditing ? (
        <>
          <div
            css={{
              textAlign: 'center',
              padding: 50,
              marginTop: 50,
              marginBottom: 50,
            }}
          >
            <div>
              Article not found.{' '}
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
        </>
      ) : (
        <BuilderContent
          key={article?.id}
          modelName="blog-article"
          content={article}
        >
          {(data, loading, article) => (
            <>
              {!article && (
                <Head>
                  <meta key="robots" name="robots" content="noindex" />
                </Head>
              )}
              {article && (
                <Head>
                  <title>{article.data.title}</title>
                  <meta name="description" content={article.data.blurb} />

                  <meta key="og:type" property="og:type" content="article" />
                  <meta
                    key="og:title"
                    property="og:title"
                    content={article.data.title}
                  />
                  <meta
                    key="og:description"
                    property="og:description"
                    content={article.data.blurb}
                  />
                  <meta
                    key="og:image"
                    property="og:image"
                    content={article.data.image}
                  />
                  <meta
                    key="twitter:card"
                    property="twitter:card"
                    content="summary_large_image"
                  />
                  <meta
                    key="twitter:title"
                    property="twitter:title"
                    content={article.data.title}
                  />
                  <meta
                    key="twitter:description"
                    property="twitter:description"
                    content={article.data.blurb}
                  />
                  <meta
                    key="twitter:image"
                    property="twitter:image"
                    content={article.data.image}
                  />
                </Head>
              )}

              <ReadProgress containerSelector=".blog-article-container" />
              <div
                css={{
                  padding: 50,
                  width: '100%',
                  maxWidth: 800,
                  margin: '0 auto',
                  [mediumBreakpointMediaQuery]: {
                    padding: 15,
                  },
                  '.builder-text': {
                    lineHeight: '1.7em',
                  },
                }}
              >
                {article && !article.data.fullPage && (
                  <div>
                    <TextLink
                      css={{
                        color: '#999',
                      }}
                      href="/blog"
                    >
                      ‹ Back to blog
                    </TextLink>
                    <div css={{ display: 'flex', alignItems: 'center' }}>
                      <div>
                        <h1
                          css={{
                            fontSize: 40,
                            marginTop: 30,
                            [mediumBreakpointMediaQuery]: {
                              fontSize: 32,
                            },
                          }}
                        >
                          {article.data.title}
                        </h1>
                        <div css={{ marginTop: 10 }}>
                          <span css={{ opacity: 0.7 }}>By</span>{' '}
                          <a
                            target="_blank"
                            rel="noopenner"
                            href={article.data.author.value?.data.url}
                            css={{
                              color: theme.colors.primary,
                            }}
                          >
                            {article.data.author.value?.data.fullName}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  css={{
                    borderRadius: 4,
                    marginTop: article?.data.fullPage ? undefined : 30,
                  }}
                >
                  <div className="blog-article-container">
                    <BuilderComponent
                      renderLink={renderLink}
                      name="blog-article"
                      content={article}
                    />
                  </div>

                  <TextLink
                    css={{
                      color: theme.colors.primary,
                      marginTop: 60,
                      fontWeight: 500,
                      fontSize: 18,
                      display: 'block',
                      textAlign: 'center',
                    }}
                    href="/blog"
                  >
                    Read more on the blog
                  </TextLink>
                  <div
                    css={{
                      width: '100vw',
                      marginLeft: 'calc(50% - 50vw)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      css={{
                        width: '100%',
                        alignSelf: 'stretch',
                        flexGrow: 1,
                        maxWidth: 1200,
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        alignItems: 'stretch',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: 80,
                        marginBottom: 20,
                        textAlign: 'center',
                        paddingBottom: 50,
                        [mediumBreakpointMediaQuery]: {
                          marginLeft: 0,
                          marginRight: 0,
                        },
                      }}
                    >
                      {articles.map((item: any, index: number) => {
                        const makeBig = index === 0;
                        return (
                          <RenderLink
                            css={{
                              cursor: 'pointer',
                              display: 'inline-block',
                            }}
                            key={item.id}
                            href={`/blog/${item.data.handle}`}
                          >
                            <AtvImg
                              css={{
                                maxWidth: 'calc(100vw - 30px)',
                                marginRight: cellSpace,
                                marginBottom: cellSpace,
                                width: cellWidth,
                              }}
                              widthMultiple={
                                makeBig ? cellWidth / 2 : cellWidth
                              }
                              heightMultiple={
                                makeBig ? cellWidth / 2 : cellWidth
                              }
                            >
                              <div
                                css={{
                                  display: 'block',
                                  height: cellImageHeight,
                                  position: 'relative',
                                  overflow: 'hidden',
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
                                  padding: 20,
                                  textAlign: 'center',
                                }}
                              >
                                <div
                                  css={{
                                    fontSize: 16,
                                    paddingLeft: 5,
                                    paddingRight: 5,
                                  }}
                                >
                                  {item.data.title}
                                </div>
                              </div>
                            </AtvImg>
                          </RenderLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </BuilderContent>
      )}
      <div css={{ maxWidth: 1200, width: '100%', margin: 'auto' }}>
        <BuilderComponent name="symbol" content={footer} />
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const results = await builder.getAll('blog-article', {
    key: 'articles:all',
    fields: 'data.handle',
  });

  return {
    paths: results
      .map((item) => ({ params: { article: item.data!.handle || '' } }))
      .concat([{ params: { article: '_' /* For previewing and editing */ } }]),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const props = await getContent(context);
  return { revalidate: 1, props, notFound: !props.article };
};

const getContent = async (context: GetStaticPropsContext) => {
  // Don't target on url and device for better cache efficiency
  const targeting = { urlPath: '/blog', device: '_' } as any;

  const [article, header, footer, articles] = await Promise.all([
    builder
      .get('blog-article', {
        userAttributes: targeting,
        key: context.params!.article as string,
        query: {
          // Get the specific article by handle
          'data.handle': context.params!.article,
        },
        ...{
          options: {
            includeRefs: true,
          } as any,
        },
      })
      .promise(),
    builder.get('docs-header', { userAttributes: targeting }).promise(),
    builder
      .get('symbol', {
        userAttributes: { ...targeting },
        entry: footerBuilderEntryId,
      })
      .promise(),
    builder.getAll('blog-article', {
      key: `blog-articles:all:_:4`,
      fields: 'data.image,data.handle,data.title',
      limit: 5,
      userAttributes: targeting,
      options: {
        noTargeting: true,
      },
      query: {
        'data.hideFromList': { $ne: true },
      },
    }),
  ]);

  return {
    article: article || null,
    header: header || null,
    footer: footer || null,
    isEditing: context.params!.article === '_',
    articles: articles
      .filter(
        (item: any) => item.data && item.data?.handle !== article?.data.handle,
      )
      .slice(0, 3),
  };
};

export default BlogArticle;
