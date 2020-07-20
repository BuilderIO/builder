import { BuilderBlock, BuilderBlocks } from '@builder.io/react';
import React from 'react';
import { Block } from './Block';

interface TextProps {
  text?: string;
  builderBlock?: any;
  attributes?: any;
}

@BuilderBlock({
  name: 'Email:Text',
  inputs: [
    {
      name: 'text',
      type: 'html',
      required: true,
      defaultValue: '<span>Enter some text...</span>',
    },
  ],
  defaultStyles: {
    lineHeight: 'normal',
    height: 'auto',
    textAlign: 'center',
  },
})
export class Text extends React.Component<TextProps> {
  render() {
    return (
      <Block attributes={this.props.attributes} builderBlock={this.props.builderBlock}>
        {/* TODO: text styling defaults hm */}
        <span dangerouslySetInnerHTML={{ __html: this.props.text! }} />
      </Block>
    );
  }
}
