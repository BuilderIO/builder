import * as React from 'react';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

import { filterAttrs, setAttrs } from '../helpers';

function SubmitButton(props: ButtonProps) {
  return (
    <button type="submit" {...{}} {...props.attributes}>
      {props.text}
    </button>
  );
}

export default SubmitButton;
