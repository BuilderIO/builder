import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { BuilderBlockComponent } from '../../builder-react';
import { withBuilder } from '../../functions/with-builder';

export interface LabelProps {
  attributes?: any;
  text?: string;
  for?: string;
  builderBlock?: BuilderElement;
}

class LabelComponent extends React.Component<LabelProps> {
  render() {
    return (
      <label htmlFor={this.props.for} {...this.props.attributes}>
        {this.props.text && (
          <span
            className="builder-label-text"
            dangerouslySetInnerHTML={{
              __html: this.props.text,
            }}
          />
        )}
        {this.props.builderBlock &&
          this.props.builderBlock.children &&
          this.props.builderBlock.children.map(item => (
            <BuilderBlockComponent key={item.id} block={item} />
          ))}
      </label>
    );
  }
}

// TODO: strict ADA mode that enforces with custom error messages that all inputs need
// labels and names
export const Label = withBuilder(LabelComponent, {
  name: 'Form:Label',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F9322342f04b545fb9a8091cd801dfb5b',
  inputs: [
    {
      name: 'text',
      type: 'html',
      richText: true,
      defaultValue: 'Label',
    },
    {
      name: 'for',
      type: 'text',
      helperText: 'The name of the input this label is for',
      advanced: true,
    },
  ],
  noWrap: true,
  static: true,
  canHaveChildren: true,
  // TODO: take inner html or blocsk
  // TODO: optional children? maybe as optional form input
  // that only shows if advanced setting is flipped
  // TODO: defaultChildren
  // canHaveChildren: true,
});
