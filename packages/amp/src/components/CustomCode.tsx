import { BuilderBlock, BuilderElement } from '@builder.io/react';
import React from 'react';

interface CustomCodeProps {
  code?: string;
  builderBlock?: BuilderElement;
}

// TODO: normal will suffice? tags: ['amp']?
@BuilderBlock({
  name: 'Amp:CustomCode',
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
    return <span dangerouslySetInnerHTML={{ __html: this.props.code! }} />;
  }
}
