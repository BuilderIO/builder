import { RenderContent, processContentResult } from '@builder.io/sdk-react';
import { getAllPathnames, getProps } from '@builder.io/sdks-e2e-tests';
import type {
  GetStaticPropsContext,
  GetStaticPathsResult,
  InferGetStaticPropsType,
} from 'next';

export async function getStaticProps(x: GetStaticPropsContext<StaticProps>) {
  return {
    props: await getProps({
      pathname: x.params.index ? `/${x.params.index.join('/')}` : '/',
      processContentResult,
    }),
  };
}

type StaticProps = { index: string[] };

export function getStaticPaths(): GetStaticPathsResult<StaticProps> {
  return {
    paths: getAllPathnames('gen2').map((path) => {
      const output: StaticProps = {
        index: path === '/' ? null : path.split('/').filter(Boolean),
      };

      return { params: output };
    }),
    fallback: true,
  };
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

export default function Page(props: PageProps & { apiVersion: any }) {
  return props ? <RenderContent {...props} /> : <div>Content Not Found</div>;
}
