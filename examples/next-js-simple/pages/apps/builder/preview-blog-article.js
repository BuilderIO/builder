import { useRouter } from 'next/router'
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
// loading widgets dynamically to reduce bundle size, will only be included in bundle when is used in the content
import '@builder.io/widgets/dist/lib/builder-widgets-async'

// builder.init(builderConfig.apiKey)
builder.init('e331e76e501d4e75b90664fad3b86b17');

// builder.apiVersion = 'v1';
export async function getStaticProps({
  params,
}) {
  
  const page =
    (await builder
      .get('blog-post').toPromise()) || null
    console.log('PAGES: ',page)

  return {
    props: {
      page,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5,
  }
}


export default function Page({
  page
}) {
  const router = useRouter()
  const isPreviewingInBuilder = useIsPreviewing()
  const show404 = !page && !isPreviewingInBuilder

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }
  console.log('CLIENT PAGE: ', page)

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
          <BuilderComponent model="blog-post"/>
        </>
      )}
    </>
  )
}
