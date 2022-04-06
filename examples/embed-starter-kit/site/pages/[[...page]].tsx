import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { BuilderComponent, Builder, builder } from '@builder.io/react'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
import { getLayoutProps } from '../helpers/get-layout-props'
import { builderEditing } from '../helpers/builder-editing-hook'
import '../helpers/builder-settings'

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ page: string[] }>) {
  const pagePath = '/' + (params?.page?.join('/') || '')

  const page = await builder.get('page', { url: pagePath }).promise()

  return {
    props: {
      page: page || null,
      ...(await getLayoutProps()),
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
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const editingModel = builderEditing()

  const router = useRouter()
  if (router.isFallback) {
    return <h1>Loading...</h1>
  }
  const isLive = !Builder.isEditing && !Builder.isPreviewing
  if (!page && isLive) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    )
  }

  return (
    <>
      <Head>
        <meta name="title">{page?.title}</meta>
      </Head>

      <div
        className={editingModel ? `builder-editing-${editingModel}` : undefined}
      >
        <BuilderComponent model="page" content={page} />
      </div>

      {/* When editing the header, gray out the page body */}
      <style jsx>
        {`
          .builder-editing-header {
            opacity: 0.5;
            filter: grayscale(1);
          }
        `}
      </style>
    </>
  )
}
