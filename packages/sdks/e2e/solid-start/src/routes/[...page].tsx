import { Content, _processContentResult } from '@builder.io/sdk-solid';
import { getProps } from '@sdk/tests';
import { Show, createResource } from 'solid-js';
import { Title, useLocation, useRouteData } from 'solid-start';
import BuilderBlockWithClassName from '~/components/BuilderBlockWithClassName';

const builderBlockWithClassNameCustomComponent = {
  name: 'BuilderBlockWithClassName',
  component: BuilderBlockWithClassName,
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

export function routeData() {
  const location = useLocation();
  const [props] = createResource(() => {
    return getProps({ pathname: location.pathname, _processContentResult });
  });

  return { props };
}

export default function App() {
  const { props } = useRouteData<typeof routeData>();

  return (
    <main>
      <Title>Hello World</Title>
      <Show when={props} fallback={<div>Content Not Found</div>}>
        <Content
          {...props()}
          customComponents={[builderBlockWithClassNameCustomComponent]}
        />
      </Show>
    </main>
  );
}
