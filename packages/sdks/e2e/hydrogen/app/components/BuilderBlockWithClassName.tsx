import {Blocks} from '@builder.io/sdk-react';

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
