import React from 'react'
import { BuilderBlock } from '../../decorators/builder-block.decorator'
import { TextInput } from 'react-native';

export interface FormTextAreaProps {
  attributes?: any
  name?: string
  value?: string
  defaultValue?: string
  placeholder?: string
}

@BuilderBlock({
  name: 'Form:TextArea',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Ff74a2f3de58c4c3e939204e5b6b8f6c3',
  inputs: [
    {
      advanced: true,
      name: 'value',
      type: 'string'
    },
    {
      name: 'defaultValue',
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
  defaultStyles: {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderRadius: '3px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ccc'
  },
  noWrap: true
})
export class TextArea extends React.Component<FormTextAreaProps> {
  render() {
    return (
      <TextInput
        placeholder={this.props.placeholder}
        name={this.props.name}
        value={this.props.value}
        defaultValue={this.props.defaultValue}
        {...this.props.attributes}
      />
    )
  }
}
