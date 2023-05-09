import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { BuilderComponent, builder, useIsPreviewing, BuilderContent } from '@builder.io/react'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
import builderConfig from '@config/builder'
// loading widgets dynamically to reduce bundle size, will only be included in bundle when is used in the content
import '@builder.io/widgets/dist/lib/builder-widgets-async'
import * as fs from 'fs';

// builder.init(builderConfig.apiKey)
builder.init('271bdcf584e24ca896dede7a91dfb1cb');
const locale ='en';
// builder.apiVersion = 'v1';
export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ page: string[] }>) {
  
  const page =
    (await builder
      .get('page', {
        userAttributes: {
          urlPath: '/' + (params?.page?.join('/') || ''),
          tags: 'previousShopper'
        }, 
        options: {
          enrich: true
        },
        locale
      }).toPromise()) || null

    console.log('PAGES: ',page)
  
  const footer =
      (await builder
        .get('footer', {
          userAttributes: {
            tags: 'whaatever else'
          }
        })
        .toPromise()) || null

  return {
    props: {
      page,
      footer
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5,
  }
}

export async function getStaticPaths() {
  const pages = await builder.getAll('page', {
    options: { noTargeting: true },
    omit: 'data.blocks',
  })

  return {
    paths: pages.map((page) => `${page.data?.url}`),
    fallback: true,
  }
}

export default function Page({
  page,
  footer
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const isPreviewingInBuilder = useIsPreviewing()
  const show404 = !page && !isPreviewingInBuilder

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }
  console.log('CLIENT PAGE: ', page)

  const handleClick = () => {
    builder.track('my-custom-event');
    builder.trackConversion(99);
    builder.track('some-other-event', { meta: { productId: 'abc123', somethingElse: true }})
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {!page && <meta name="robots" content="noindex" />}
      </Head>
      {show404 ? (
        <DefaultErrorPage statusCode={404} />
      ) : (
        <>
          {/* <BuilderContent model="page" content={page}>
            {(data, loading, content) => {
                return (<>
                    <div>{data?.title}</div>
                    <h1 onClick={handleClick}>Button is {data?.hideBuyButton ? 'hidden' : 'visible'} </h1>
                    <BuilderComponent locale={locale} model="page" content={page} />
                  </>)
            }}
          </BuilderContent>  */}

          <BuilderComponent locale={locale} model="page" content={page} data={{user: 'Tim', fundType: ' large cap'}}/>
          <BuilderContent model="footer" content={footer}> 
            {(data, loading, content) => {
              // console.log('hello:', data)
                return (
                <>
                     {data?.footerLinks?.map((link:any) => {
                       return link?.footerLink?.map((innerLink:any) => {
                         return <a href={innerLink.linkUrl}>{innerLink.linkName}</a>
                       })
                     })
                   }
                </>
                )
            }}
          </BuilderContent>
        </>
      )}
    </>
  )
}
