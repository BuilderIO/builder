'use client';
import type { BuilderBlock } from '@builder.io/sdk-react-nextjs';
import { Blocks } from '@builder.io/sdk-react-nextjs';

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
