import React from 'react';
import { BuilderBlock } from '../../decorators/builder-block.decorator';

export interface LabelProps {
  attributes?: any;
  text?: string;
  for?: string;
}

@BuilderBlock({
  name: 'Form:Label',
  image:
    'https://cdn.builder.codes/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F9322342f04b545fb9a8091cd801dfb5b',
  inputs: [
    {
      name: 'text',
      type: 'text',
    },
    {
      name: 'for',
      type: 'text',
      advanced: true,
    },
  ],
  ...({
    noWrap: true,
  } as any),
  // TODO: take inner html or blocsk
  // TODO: optional children? maybe as optional form input
  // that only shows if advanced setting is flipped
  // TODO: defaultChildren
  // canHaveChildren: true,
})
export class LabelProps extends React.Component<LabelProps> {
  render() {
    return (
      <label for={this.props.for} {...this.props.attributes}>
        {this.props.text}
      </label>
    );
  }
}
