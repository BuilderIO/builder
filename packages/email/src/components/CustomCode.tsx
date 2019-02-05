import { BuilderBlock, BuilderBlocks } from '@builder.io/react';
import React from 'react';
import { Block } from './Block';

interface CustomCodeProps {
  code?: string;
  builderBlock?: any;
  attributes?: any;
}

@BuilderBlock({
  name: 'Email:CustomCode',
  inputs: [
    {
      name: 'code',
      type: 'html',
      required: true,
      defaultValue: 'I am custom html',
    },
  ],
})
export class CustomCode extends React.Component<CustomCodeProps> {
  render() {
    return (
      <Block attributes={this.props.attributes} builderBlock={this.props.builderBlock}>
        <span dangerouslySetInnerHTML={{ __html: this.props.code! }} />
      </Block>
    );
  }
}
