import { useTarget } from '@builder.io/mitosis';
import { filterAttrs } from '../helpers';

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

export default function SubmitButton(props: ButtonProps) {
  return (
    <button
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
      type="submit"
    >
      {props.text}
    </button>
  );
}
