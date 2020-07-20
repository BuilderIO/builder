import { BuilderBlock, BuilderBlocks, BuilderElement } from '@builder.io/react';
import React from 'react';

interface TextProps {
  text?: string;
  builderBlock?: BuilderElement;
}

@BuilderBlock({
  name: 'Amp:Text',
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
    return <span dangerouslySetInnerHTML={{ __html: this.props.text! }} />;
  }
}
