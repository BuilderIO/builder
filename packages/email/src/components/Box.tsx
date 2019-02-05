import { BuilderBlock, BuilderBlocks } from '@builder.io/react';
import React from 'react';
import { Block } from './Block';

interface BoxProps {
  builderBlock?: any;
  attributes?: any;
  children?: any[]; // Ideally accept react nodes too
  verticalAlignContent?: string;
}

// TODO: acceptsChildren option?
@BuilderBlock({
  name: 'Email:Box',
  inputs: [
    {
      name: 'children',
      type: 'uiBlocks',
      defaultValue: [],
      // showNoBlocks: false
      hideFromUI: true,
    },
    {
      name: 'verticalAlignContent',
      type: 'string',
      enum: ['top', 'bottom', 'middle'],
      defaultValue: 'top',
    },
  ],
  defaultStyles: {
    height: '200px',
  },
  // acceptChildren: 'children'
  // Share these hooks across the projects
  // hooks: {
  //   'BlocksOverlay::debounceNextTickUpdateStyles#updateStyles': () => convert margin selectors to paddings of table
  //   '@builder.io/app:Style.foo': () => { /* ... */ } // maybe optionally async
  // }
})
export class Box extends React.Component<BoxProps> {
  render() {
    return (
      <Block
        attributes={this.props.attributes}
        builderBlock={this.props.builderBlock}
        innerStyleOverrides={{ verticalAlign: this.props.verticalAlignContent }}
      >
        {/* Better way to do this? */}
        <BuilderBlocks blocks={this.props.children} dataPath="children" emailMode />
      </Block>
    );
  }
}
