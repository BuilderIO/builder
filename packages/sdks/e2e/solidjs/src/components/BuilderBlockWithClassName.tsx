import { Blocks } from '@builder.io/sdk-solid';
import type { Component } from 'solid-js';

const BuilderBlockWithClassName: Component<{
  builderBlock?: any;
  content: any;
}> = (props) => {
  return (
    <div>
      <Blocks
        parent={props.builderBlock?.id}
        path="component.options.content"
        blocks={props.content}
        className="test-class-name"
      />
    </div>
  );
};

export default BuilderBlockWithClassName;
