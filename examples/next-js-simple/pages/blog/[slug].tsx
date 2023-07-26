import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'

import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
// loading widgets dynamically to reduce bundle size, will only be included in bundle when is used in the content
import '@builder.io/widgets/dist/lib/builder-widgets-async'
import * as fs from 'fs';

// builder.init(builderConfig.apiKey)
// builder.init('271bdcf584e24ca896dede7a91dfb1cb');

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ slug: string[] }>) {
    console.log('hello: ', params?.slug)
  const articleData =
    (await builder
      .get('article', {
        query: {
            'data.slug': params?.slug
        }
      }).toPromise()) || null

      
      const articleTemplate = 
      (await builder
        .get('blog-template', {
            userAttributes: {
                urlPath: '/blog/' + (params?.slug),
                category: articleData?.category
            }
        })
        .toPromise()) || null
        
    console.log('hello article: ',articleData)
    console.log('hello template: ', articleTemplate);

  return {
    props: {
      articleData,
      articleTemplate
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5,
  }
}

export async function getStaticPaths() {
  const articles = await builder.getAll('articles', {
    options: { noTargeting: true },
    omit: 'data.blocks',
  })

  return {
    paths: articles.map((article) => `/blog/${article.data?.slug}`),
    fallback: true,
  }
}

export default function Page({
  articleData,
  articleTemplate
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const isPreviewingInBuilder = useIsPreviewing()
  const show404 = !articleData && !isPreviewingInBuilder
  console.log('hello article: ',articleData)
  console.log('hello template: ', articleTemplate);
  if (router.isFallback) {
    return <h1>Loading...</h1>
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {!articleData && <meta name="robots" content="noindex" />}
      </Head>
      {show404 ? (
        <DefaultErrorPage statusCode={404} />
      ) : (
        <>
          <BuilderComponent model="ad-block" />
          <BuilderComponent model="blog-template" content={articleTemplate} data={{article: articleData?.data}}/>
        </>
      )}
    </>
  )
}
