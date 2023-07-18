import { useTarget } from '@builder.io/mitosis';
import { filterVueAttrs } from '../helpers';

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

export default function SubmitButton(props: ButtonProps) {
  return (
    <button
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
      type="submit"
    >
      {props.text}
    </button>
  );
}
