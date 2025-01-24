import BuilderBlockWithClassName from '@/components/BuilderBlockWithClassName';
import {
  Content,
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-react';
import { getProps } from '@sdk/tests';

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

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<Record<string, string>>;
}

// Pages are Server Components by default
export default async function Page(props: PageProps) {
  const urlPath = '/' + ((await props.params)?.slug?.join('/') || '');

  const builderProps = await getProps({
    pathname: urlPath,
    _processContentResult,
    options: getBuilderSearchParams(await props.searchParams),
    fetchOneEntry,
  });

  if (!builderProps.content) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    );
  }

  builderProps.customComponents = [builderBlockWithClassNameCustomComponent];

  return <Content {...builderProps} />;
}

export const revalidate = 4;
