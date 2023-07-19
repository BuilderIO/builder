import { useTarget } from '@builder.io/mitosis';
import { filterAttrs } from '../helpers';

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
          ...filterAttrs(props.attributes, 'v-on:', true),
          ...filterAttrs(props.attributes, 'v-on:', false),
        },
        vue3: {
          ...filterAttrs(props.attributes, 'v-on:', true),
          ...filterAttrs(props.attributes, 'v-on:', false),
        },
        svelte: {
          ...filterAttrs(props.attributes, 'on:', true),
          ...filterAttrs(props.attributes, 'on:', false),
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
