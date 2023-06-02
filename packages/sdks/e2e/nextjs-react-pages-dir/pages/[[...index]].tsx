// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-react';
import { ALL_PATHNAMES, getProps } from '@builder.io/sdks-e2e-tests';
import type {
  GetStaticPropsContext,
  GetStaticPathsResult,
  InferGetStaticPropsType,
} from 'next';

export async function getStaticProps(x: GetStaticPropsContext<StaticProps>) {
  return {
    props: await getProps(
      x.params.index ? `/${x.params.index.join('/')}` : '/'
    ),
  };
}

type StaticProps = { index: string[] };

export function getStaticPaths(): GetStaticPathsResult<StaticProps> {
  return {
    paths: ALL_PATHNAMES.map((path) => {
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
