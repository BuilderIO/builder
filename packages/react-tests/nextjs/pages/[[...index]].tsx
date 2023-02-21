import { ALL_PATHNAMES, getAPIKey, getProps } from '@builder.io/sdks-e2e-tests';
import { useRouter } from 'next/router';
import type {
  GetStaticPaths,
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';

builder.init(getAPIKey());

type StaticProps = { index: string[] };

export async function getStaticProps(x: GetStaticPropsContext<StaticProps>) {
  return { props: getProps('/' + x.params.index?.join('/') || '') };
}

export function getStaticPaths(): GetStaticPathsResult<StaticProps> {
  return {
    paths: ALL_PATHNAMES.map(path => {
      const output: StaticProps = {
        index: path === '/' ? null : path.split('/').filter(Boolean),
      };

      return { params: output };
    }),
    fallback: true,
  };
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

export default function Page(props: PageProps) {
  const router = useRouter();
  const isPreviewingInBuilder = useIsPreviewing();
  const show404 = !props.content && !isPreviewingInBuilder;

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {!props.content && <meta name="robots" content="noindex" />}
      </Head>
      {show404 ? (
        <DefaultErrorPage statusCode={404} />
      ) : (
        <BuilderComponent model="page" content={props.content} />
      )}
    </>
  );
}
