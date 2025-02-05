import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, _processContentResult } from '@builder.io/sdk-qwik';
import { getProps } from '@sdk/tests';
import BuilderBlockWithClassName from '~/components/BuilderBlockWithClassName';

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

export const useBuilderContentLoader = routeLoader$(async (event) => {
  const data = await getProps({
    pathname: event.url.pathname,
    _processContentResult,
  });
  if (!data) {
    event.status(404);
  }
  return data;
});

export default component$(() => {
  const contentProps = useBuilderContentLoader();
  return (
    <>
      {contentProps.value.addTopPadding && (
        <div style={{ marginTop: '2000px' }} class="builder-margin-element" />
      )}
      {contentProps.value ? (
        <Content
          {...(contentProps.value as any)}
          customComponents={[builderBlockWithClassNameCustomComponent]}
        />
      ) : (
        <div>Content Not Found</div>
      )}
    </>
  );
});
