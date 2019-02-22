import React from 'react'
import { BuilderBlock } from '../../decorators/builder-block.decorator'

export interface FormTextAreaProps {
  attributes?: any
  name?: string
  value?: string
  placeholder?: string
}

@BuilderBlock({
  name: 'Form:TextArea',
  image:
    'https://cdn.builder.codes/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Ff74a2f3de58c4c3e939204e5b6b8f6c3',
  inputs: [
    {
      name: 'value',
      type: 'string'
    },
    {
      name: 'placeholder',
      type: 'string',
      defaultValue: 'Hello there'
    },
    {
      name: 'name',
      type: 'string'
      // advanced: true,
    },
    {
      name: 'required',
      type: 'boolean',
      defaultValue: false
    }
  ],
  noWrap: true
})
export class TextArea extends React.Component<FormTextAreaProps> {
  render() {
    return (
      <textarea
        placeholder={this.props.placeholder}
        name={this.props.name}
        value={this.props.value}
        {...this.props.attributes}
      />
    )
  }
}
