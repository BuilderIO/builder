import { HydrationOverlay } from '@builder.io/react-hydration-overlay';
import { Content, _processContentResult } from '@builder.io/sdk-react';
import { getAllPathnames, getProps } from '@sdk/tests';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import React from 'react';
import BuilderBlockWithClassName from '../components/BuilderBlockWithClassName';
import Hello from '../components/Hello';

const builderBlockWithClassNameCustomComponent = {
  name: 'BuilderBlockWithClassName',
  component: BuilderBlockWithClassName,
  isRSC: true,
  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderContext: true,
    builderComponents: true,
  },
  inputs: [
    {
      name: 'content',
      type: 'uiBlocks',
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-c6e179528dee4e62b337cf3f85d6496f',
          component: {
            name: 'Text',
            options: {
              text: 'Enter some text...',
            },
          },
          responsiveStyles: {
            large: {
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              flexShrink: '0',
              boxSizing: 'border-box',
              marginTop: '20px',
              lineHeight: 'normal',
              height: 'auto',
            },
          },
        },
      ],
    },
  ],
};

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
      {props ? (
        <Content
          {...props}
          customComponents={[
            {
              name: 'Hello',
              component: Hello,
              inputs: [],
            },
            builderBlockWithClassNameCustomComponent,
          ]}
        />
      ) : (
        <div>Content Not Found</div>
      )}
    </HydrationOverlay>
  );
}
