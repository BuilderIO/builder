import { useRouter } from 'next/router'
import { builder, BuilderComponent } from '@builder.io/react'
import Head from 'next/head'
import { getLayoutProps } from '../helpers/get-layout-props'

import '../helpers/builder-settings'

export async function getServerSideProps() {
  return {
    props: {
      page: (await builder.get('page', { url: '/' }).promise()) || null,
      ...(await getLayoutProps()),
    },
  }
}

export default function ThemePreview(props: { page: any }) {
  const router = useRouter()
  if (router.isFallback) {
    return <h1>Loading...</h1>
  }

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <BuilderComponent model="page" content={props.page} />
    </>
  )
}
