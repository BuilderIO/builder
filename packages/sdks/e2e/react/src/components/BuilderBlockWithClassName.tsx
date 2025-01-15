import { Blocks } from '@builder.io/sdk-react';

export const builderBlockWithClassNameCustomComponent = {
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

function BuilderBlockWithClassName(props: any) {
  return (
    <div>
      <Blocks
        parent={props.builderBlock?.id}
        path={`component.options.content`}
        blocks={props.content}
        className="test-class-name"
      />
    </div>
  );
}

export default BuilderBlockWithClassName;
