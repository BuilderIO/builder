import React from 'react'
import { BuilderBlock } from '../../decorators/builder-block.decorator'
import { BuilderElement } from '@builder.io/sdk'
import { BuilderBlockComponent } from '../../builder-react'

export interface LabelProps {
  attributes?: any
  text?: string
  for?: string
  builderBlock?: BuilderElement
}

@BuilderBlock({
  name: 'Form:Label',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F9322342f04b545fb9a8091cd801dfb5b',
  inputs: [
    {
      name: 'text',
      type: 'text',
      defaultValue: 'Label'
    },
    {
      name: 'for',
      type: 'text',
      helperText: 'The name of the input this label is for',
      advanced: true
    }
  ],
  noWrap: true,
  canHaveChildren: true
  // TODO: take inner html or blocsk
  // TODO: optional children? maybe as optional form input
  // that only shows if advanced setting is flipped
  // TODO: defaultChildren
  // canHaveChildren: true,
})
export class Label extends React.Component<LabelProps> {
  render() {
    return (
      <label htmlFor={this.props.for} {...this.props.attributes}>
        {this.props.text}
        {this.props.builderBlock &&
          this.props.builderBlock.children &&
          this.props.builderBlock.children.map(item => (
            <BuilderBlockComponent key={item.id} block={item} />
          ))}
      </label>
    )
  }
}
