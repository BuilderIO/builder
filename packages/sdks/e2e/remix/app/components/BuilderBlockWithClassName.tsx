import { Blocks, BuilderBlock } from '@builder.io/sdk-react';

interface BuilderBlockWithClassNameProps {
  builderBlock: BuilderBlock;
  content: BuilderBlock[];
}

function BuilderBlockWithClassName(props: BuilderBlockWithClassNameProps) {
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
