import BuilderBlockWithClassName from '@/components/BuilderBlockWithClassName';
import {
  Content,
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-react';
import { getProps } from '@sdk/tests';

interface PageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

// Pages are Server Components by default
export default async function Page(props: PageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');

  const builderProps = await getProps({
    pathname: urlPath,
    _processContentResult,
    options: getBuilderSearchParams(props.searchParams),
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

  return (
    <Content
      {...builderProps}
      customComponents={[
        {
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
        },
      ]}
    />
  );
}

export const revalidate = 4;
