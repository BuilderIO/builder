import { getAPIKey, getProps } from '@builder.io/sdks-e2e-tests';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';

// const getPathname = (x: string) => {
//   if (x === '/[[...index]]') {
//     return '/';
//   } else {
//     return x;
//   }
// };

// function App() {
//   const router = useRouter();

//   const props = getProps(getPathname(router.asPath));
//   return props ? <RenderContent {...props} /> : <div>Content Not Found</div>;
// }

// we have this empty fn to force NextJS to opt out of static optimization
// https://nextjs.org/docs/advanced-features/automatic-static-optimization
export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}

builder.init(getAPIKey());

export async function getStaticProps({ params }: GetStaticPropsContext<{ page: string[] }>) {
  const page =
    (await builder
      .get('page', {
        userAttributes: {
          urlPath: '/' + (params?.page?.join('/') || ''),
        },
      })
      .toPromise()) || null;

  return {
    props: {
      page,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5,
  };
}

export async function getStaticPaths() {
  const pages = await builder.getAll('page', {
    options: { noTargeting: true },
    omit: 'data.blocks',
  });

  return {
    paths: pages.map(page => `${page.data?.url}`),
    fallback: true,
  };
}

export default function Page({ page }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const isPreviewingInBuilder = useIsPreviewing();
  const show404 = !page && !isPreviewingInBuilder;

  if (router.isFallback) {
    return <h1>Loading...</h1>;
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
        <BuilderComponent model="page" content={page} />
      )}
    </>
  );
}
