import React from 'react';
import { BuilderBlock } from '../decorators/builder-block.decorator';
import HTML from 'react-native-render-html';

@BuilderBlock({
  name: 'Custom Code',
  inputs: [
    {
      name: 'code',
      type: 'longText',
      required: true,
      defaultValue: '<p>Hello there, I am custom HTML code!</p>',
    },
  ],
})
export class CustomCode extends React.Component<{ code: string }> {

  componentDidMount() {
    // TODO: parse and run scripts (?)
  }

  render() {
    return <HTML html={this.props.code || ' '} />;
  }
}
