import type { Component } from 'solid-js';
import { createResource, Show } from 'solid-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { _processContentResult, Content } from '@builder.io/sdk-solid';
import { getProps } from '@sdk/tests';
import BuilderBlockWithClassName from './components/BuilderBlockWithClassName';

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

const App: Component = () => {
  const [props] = createResource(() => getProps({ _processContentResult }));

  return (
    <Show
      when={!props.loading && !props.error}
      fallback={<div>Content Not Found</div>}
    >
      {() => {
        const propsForContent = props();
        propsForContent.customComponents = [
          builderBlockWithClassNameCustomComponent,
        ];
        return <Content {...propsForContent} />;
      }}
    </Show>
  );
};

export default App;
