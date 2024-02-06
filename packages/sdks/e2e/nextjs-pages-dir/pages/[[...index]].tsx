import { HydrationOverlay } from '@builder.io/react-hydration-overlay';
import { Content, _processContentResult } from '@builder.io/sdk-react';
import { getAllPathnames, getProps } from '@e2e/tests';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import React from 'react';

export async function getStaticProps(x: GetStaticPropsContext<StaticProps>) {
  return {
    props: await getProps({
      pathname: x.params?.index ? `/${x.params.index.join('/')}` : '/',
      _processContentResult,
    }),
  };
}

type StaticProps = { index: string[] };

export function getStaticPaths(): GetStaticPathsResult<StaticProps> {
  return {
    paths: getAllPathnames('gen2').map((path) => {
      const output: StaticProps = {
        index: path === '/' ? [] : path.split('/').filter(Boolean),
      };

      return { params: output };
    }),
    fallback: true,
  };
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
export default function Page(props: PageProps & { apiVersion: any }) {
  return (
    <HydrationOverlay>
      {props ? <Content {...props} /> : <div>Content Not Found</div>}
    </HydrationOverlay>
  );
}
