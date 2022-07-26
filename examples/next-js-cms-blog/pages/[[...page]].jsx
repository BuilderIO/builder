import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import DefaultErrorPage from 'next/error';
import { useRouter } from 'next/router';
import Layout from '@/components/layout';
import Head from 'next/head';

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);

export default function Page({ page }) {
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  const isPreviewing = useIsPreviewing();
  if (!page && !isPreviewing) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
          <meta name="title"></meta>
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    );
  }
  return (
    <>
      <Layout>
        <Head>
          <title>Next.js Blog Example with Builder.io</title>
        </Head>
        {/* Integrating landing pages to the app */}
        {/* https://www.builder.io/c/docs/integrating-builder-pages */}
        <BuilderComponent model="page" content={page} />
      </Layout>
    </>
  );
}

export async function getStaticPaths() {
  const pages = await builder.getAll('page', {
    options: { noTargeting: true },
  });

  return {
    paths: pages.map(page => `${page.data?.url}`),
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
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
    revalidate: 5,
  };
}
