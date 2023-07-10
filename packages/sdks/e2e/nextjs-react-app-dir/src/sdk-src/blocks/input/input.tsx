'use client';
import * as React from 'react';

export interface FormInputProps {
  type?: string;
  attributes?: any;
  name?: string;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

import { isEditing } from '../../functions/is-editing';

function FormInputComponent(props: FormInputProps) {
  return (
    <input
      {...props.attributes}
      key={
        isEditing() && props.defaultValue ? props.defaultValue : 'default-key'
      }
      placeholder={props.placeholder}
      type={props.type}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
      required={props.required}
    />
  );
}

export default FormInputComponent;
