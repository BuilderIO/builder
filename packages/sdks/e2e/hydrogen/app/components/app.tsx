import {Content} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {getProps} from '@sdk/tests';
import {useNonce} from '@shopify/hydrogen';
import BuilderBlockWithClassName from './BuilderBlockWithClassName';

const builderBlockWithClassNameCustomComponent = {
  name: 'BuilderBlockWithClassName',
  component: BuilderBlockWithClassName,
  shouldReceiveBuilderProps: {
    builderBlock: true,
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

export const builderLoader: LoaderFunction = async ({params}) => {
  try {
    const pathname = `/${params['*'] || ''}`;
    return await getProps({pathname});
  } catch (e) {
    console.error(e);
    return {content: null};
  }
};

export default function BuilderPage() {
  const builderProps = useLoaderData<ReturnType<typeof getProps>>();
  builderProps.customComponents = [builderBlockWithClassNameCustomComponent];
  const nonce = useNonce();

  return builderProps?.content ? (
    <Content nonce={nonce} {...builderProps} />
  ) : (
    <div>Content Not Found.</div>
  );
}
