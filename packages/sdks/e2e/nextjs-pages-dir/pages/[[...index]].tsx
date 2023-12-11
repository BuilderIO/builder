import { getAllPathnames, getProps } from '@e2e/tests';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import { RenderContent, _processContentResult } from '../src/sdk-src';

import * as client from 'react-dom/client';

const oldClientHydrateRoot = client.hydrateRoot as any;
(client as any).hydrateRoot = new Proxy(oldClientHydrateRoot, {
  apply: (wrappingTarget, thisArg, args) => {
    const oldOnRecoverableError = args[2].onRecoverableError;

    args[2].onRecoverableError = new Proxy(oldOnRecoverableError, {
      apply: (inner_wrappingTarget, inner_thisArg, inner_args) => {
        const error = inner_args[0];
        const errorInfo = inner_args[1];
        // log out error + 'componentStack' in production
        console.log(error, errorInfo.componentStack);
      },
    });
    // if y'all use Sentry (https://sentry.io/for/nextjs/)
    // Sentry.captureException(error, { contexts: { react: { componentStack 3 3 3);
    return wrappingTarget.apply(thisArg, args as any);
  },
});

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
  return props ? <RenderContent {...props} /> : <div>Content Not Found</div>;
}
