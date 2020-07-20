import React from 'react';
import { Builder } from '@builder.io/sdk';
import { withBuilder } from '../../functions/with-builder';

// TODO: how do onchange...
// TODO: actions all custom events and custom js gets
// passed an element reference and listens for events....
// Needs to unsubscribe, so must manage
export interface FormInputProps {
  type?: string;
  attributes?: any;
  name?: string;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

class FormInputComponent extends React.Component<FormInputProps> {
  render() {
    return (
      <input
        key={Builder.isEditing && this.props.defaultValue ? this.props.defaultValue : 'default-key'}
        placeholder={this.props.placeholder}
        type={this.props.type}
        name={this.props.name}
        value={this.props.value}
        defaultValue={this.props.defaultValue}
        required={this.props.required}
        {...this.props.attributes}
      />
    );
  }
}

export const FormInput = withBuilder(FormInputComponent, {
  name: 'Form:Input',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Fad6f37889d9e40bbbbc72cdb5875d6ca',
  inputs: [
    {
      name: 'type',
      type: 'text',
      enum: [
        'text',
        'number',
        'email',
        'url',
        'checkbox',
        'radio',
        'range',
        'date',
        'datetime-local',
        'search',
        'tel',
        'time',
        'file',
        'month',
        'week',
        'password',
        'color',
        'hidden',
      ],
      defaultValue: 'text',
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      helperText:
        'Every input in a form needs a unique name describing what it takes, e.g. "email"',
    },
    {
      name: 'placeholder',
      type: 'string',
      defaultValue: 'Hello there',
      helperText: 'Text to display when there is no value',
    },
    // TODO: handle value vs default value automatically like ng-model
    {
      name: 'defaultValue',
      type: 'string',
    },
    {
      name: 'value',
      type: 'string',
      advanced: true,
    },

    {
      name: 'required',
      type: 'boolean',
      helperText: 'Is this input required to be filled out to submit a form',
      defaultValue: false,
    },
  ],
  // TODO
  // TODO: call editorHooks?
  // ...({
  //   hooks: {
  //     'ElementLayout:shiftBottomSide': (element: Element, amount: number, snap: boolean) => {
  //       // TODO: either update line height or split the padding padding on bottom sides hmm
  //     }
  //   } as any,
  // }),
  noWrap: true,
  static: true,
  defaultStyles: {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderRadius: '3px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ccc',
  },
});
