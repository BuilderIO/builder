import { filterAttrs, setAttrs } from '../helpers';

import { Fragment, component$, h } from '@builder.io/qwik';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface TextareaProps {
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
}
export const Textarea = component$((props: TextareaProps) => {
  return (
    <textarea
      {...{}}
      {...props.attributes}
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
    ></textarea>
  );
});

export default Textarea;
