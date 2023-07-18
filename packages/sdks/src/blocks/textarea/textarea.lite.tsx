import { useTarget } from '@builder.io/mitosis';
import { filterVueAttrs } from '../helpers';

export interface TextareaProps {
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
}

export default function Textarea(props: TextareaProps) {
  return (
    <textarea
      {...useTarget({
        vue2: {
          ...filterVueAttrs(props.attributes, true),
          ...filterVueAttrs(props.attributes, false),
        },
        vue3: {
          ...filterVueAttrs(props.attributes, true),
          ...filterVueAttrs(props.attributes, false),
        },
        default: props.attributes,
      })}
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
    />
  );
}
