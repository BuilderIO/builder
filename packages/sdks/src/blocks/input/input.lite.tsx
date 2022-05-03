import { isEditing } from '../../functions/is-editing';
import { componentInfo } from './component-info';
import '@builder.io/mitosis';
import { useMetadata } from '@builder.io/mitosis';

export interface FormInputProps {
  type?: string;
  attributes?: any;
  name?: string;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

export default function FormInputComponent(props: FormInputProps) {
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

useMetadata({ componentInfo });
