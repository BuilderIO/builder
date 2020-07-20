import React from 'react';
import { BuilderBlock, BuilderBlockComponent, BuilderElement } from '@builder.io/react';

interface BoxProps {
  builderBlock?: BuilderElement;
  attributes?: any;
}

// TODO: acceptsChildren option?
@BuilderBlock({
  name: 'Amp:Box',
  canHaveChildren: true,
  noWrap: true,
  defaultStyles: {
    height: '200px',
  },
  // Share these hooks across the projects
  // hooks: {
  //   'BlocksOverlay::debounceNextTickUpdateStyles#updateStyles': () => convert margin selectors to paddings of table
  //   '@builder.io/app:Style.foo': () => { /* ... */ } // maybe optionally async
  // }
})
export class Box extends React.Component<BoxProps> {
  render() {
    return (
      <div {...this.props.attributes}>
        {this.props.builderBlock &&
          this.props.builderBlock.children &&
          this.props.builderBlock.children.map(item => (
            <BuilderBlockComponent key={item.id} block={item} />
          ))}
      </div>
    );
  }
}
