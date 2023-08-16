import { filterAttrs, setAttrs } from '../helpers';

import { Fragment, component$, h } from '@builder.io/qwik';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface ButtonProps {
  attributes?: any;
  text?: string;
}
export const SubmitButton = component$((props: ButtonProps) => {
  return (
    <button type="submit" {...{}} {...props.attributes}>
      {props.text}
    </button>
  );
});

export default SubmitButton;
