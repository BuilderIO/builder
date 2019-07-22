import React from 'react';
import { BuilderBlock } from '../../decorators/builder-block.decorator';
import { Button } from 'react-native';
import HTML from 'react-native-render-html';

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

// TODO: spec all of these as generic builder elements
// and codegen to Vue, React, Angular.........
@BuilderBlock({
  name: 'Form:SubmitButton',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Fdf2820ffed1f4349a94c40b3221f5b98',
  defaultStyles: {
    appearance: 'none',
    paddingTop: '15px',
    paddingBottom: '15px',
    paddingLeft: '25px',
    paddingRight: '25px',
    backgroundColor: '#3898EC',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  inputs: [
    {
      name: 'text',
      type: 'text',
      defaultValue: 'Click me',
    },
  ],
  noWrap: true,
  // TODO: optional children? maybe as optional form input
  // that only shows if advanced setting is flipped
  // TODO: defaultChildren
  // canHaveChildren: true,
})
export class FormSubmitButton extends React.Component<ButtonProps> {
  render() {
    return (
      <Button type="submit" {...this.props.attributes}>
        <HTML html={this.props.text || ' '} />
      </Button>
    );
  }
}
