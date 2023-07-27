import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { BuilderComponent, builder, useIsPreviewing, withChildren, BuilderContent, Builder, Image } from '@builder.io/react'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
import builderConfig from '@config/builder'
// loading widgets dynamically to reduce bundle size, will only be included in bundle when is used in the content
import '@builder.io/widgets/dist/lib/builder-widgets-async'
import '@components/hero/Hero'

// const MyImage = (props: any) => {
//   return <Image {...props} /> 
// }
//ignore
// console.log('COLUMNS: ', Image?.input)
// Builder.registerComponent(MyImage, {
//   name: 'Image',
//   friendlyName: 'Mobile Only Button',
  
//   // Signify that this is an override
//   override: true,

//   inputs: [
//     {
//       name:'test',
//       type: 'text'
//     },
//     // ...Image?.inputs
//   ]
// });

const locale ='can-CAD';

// builder.apiVersion = 'v1';
export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ page: string[] }>) {

  const page =
    (await builder
      .get('product-pdp', {
        // userAttributes: {
        //   urlPath: '/' + (params?.page?.join('/') || ''),
        // },
        // enrich: true,
        // options: {
        //   enrich:  true
        // },
        query: {
          id: '7ae7feccc69a4d6c8c5cb0e25ca219b9'
        },
        locale
      }).toPromise()) || null

    console.log('PAGES: ',page?.data?.state?.specialOffers)

  const footer =
      (await builder
        .get('footer')
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
  footer,
  demoSection
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const isPreviewingInBuilder = useIsPreviewing()
  const show404 = !page && !isPreviewingInBuilder
  console.log('DEMO SECTION: ', demoSection)

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }
  console.log('client page: ', page)
  const handleClick = () => {
    builder.track('my-custom-event');
    builder.trackConversion(99);
    builder.track('some-other-event', { meta: { productId: 'abc123', somethingElse: true }})
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        {!page && <meta name="robots" content="noindex" />}
      </Head>
      {show404 ? (
        <DefaultErrorPage statusCode={404} />
      ) : (
        <> 
          <BuilderComponent model="product-pdp" locale={locale} content={page} data={{ values: {"this-and-that": "whatever", "osmehting!": "this other"}, username: 'tim', hideAnyButton: true, locale}} />
          {/* <BuilderComponent model="footer"></BuilderComponent> */}
          {/* <BuilderContent model="footer" content={footer}> 
            {(data, loading, content) => {
                return (
                <>
                     {data?.footerLinks?.map((link:any) => {
                       return link?.footerLink?.map((innerLink:any) => {
                         return <a key={innerLink.id} href={innerLink.linkUrl}>{innerLink.linkName}</a>
                       })
                     })
                   }
                </>
                )
            }}
          </BuilderContent> */}
        </>
      )}
    </>
  )
}
