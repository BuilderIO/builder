'use client';
import type { BuilderBlock } from '@builder.io/sdk-react';
import { Blocks } from '@builder.io/sdk-react';

interface BuilderBlockWithClassNameProps {
  builderBlock: BuilderBlock;
  content: BuilderBlock[];
  builderContext: any;
  builderComponents: any;
}

export default function BuilderBlockWithClassName(
  props: BuilderBlockWithClassNameProps
) {
  return (
    <div>
      <Blocks
        parent={props.builderBlock?.id}
        path={`component.options.content`}
        context={props.builderContext}
        registeredComponents={props.builderComponents}
        blocks={props.content}
        className="test-class-name"
      />
    </div>
  );
}

export const builderBlockWithClassNameComponentConfig = {
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
