import { Content } from '@builder.io/sdk-react';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getProps } from '@sdk/tests';
import BuilderBlockWithClassName from '~/components/BuilderBlockWithClassName';

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

export const loader: LoaderFunction = async ({ params }) => {
  const { initializeNodeRuntime } = await import(
    '@builder.io/sdk-react/node/init'
  );

  await initializeNodeRuntime();
  return await getProps({ pathname: `/${params.slug || ''}` });
};

export default function Page() {
  const builderProps = useLoaderData<ReturnType<typeof getProps>>();

  builderProps.customComponents = [builderBlockWithClassNameCustomComponent];

  return builderProps?.content ? (
    <Content {...builderProps} />
  ) : (
    <div>Content Not Found.</div>
  );
}
