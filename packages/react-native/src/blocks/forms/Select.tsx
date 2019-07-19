import React from 'react'
import { BuilderBlock } from '../../decorators/builder-block.decorator'
import { Builder } from '@builder.io/sdk';
import { Picker } from 'react-native';

export interface FormSelectProps {
  options?: { name?: string; value: string }[]
  attributes?: any
  name?: string
  value?: string
  defaultValue?: string
}

@BuilderBlock({
  name: 'Form:Select',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F83acca093fb24aaf94dee136e9a4b045',
  defaultStyles: {
    alignSelf: 'flex-start'
  },
  inputs: [
    {
      name: 'options',
      type: 'list',
      required: true,
      subFields: [
        {
          name: 'value',
          type: 'text',
          required: true
        },
        {
          name: 'name',
          type: 'text'
        }
      ],
      defaultValue: [
        {
          value: 'option 1'
        },
        {
          value: 'option 2'
        }
      ]
    },
    {
      name: 'defaultValue',
      type: 'string'
    },
    {
      name: 'value',
      type: 'string',
      advanced: true
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
export class FormSelect extends React.Component<FormSelectProps> {
  render() {
    const { options } = this.props
    return (
      <Picker
        value={this.props.value}
        key={Builder.isEditing && this.props.defaultValue ? this.props.defaultValue : 'default-key'}
        defaultValue={this.props.defaultValue}
        name={this.props.name}
        {...this.props.attributes}
      >
        {options &&
          options.map(option => (
            <Picker.Item value={option.value} label={option.name || option.value}></Picker.Item>
          ))}
      </Picker>
    )
  }
}
