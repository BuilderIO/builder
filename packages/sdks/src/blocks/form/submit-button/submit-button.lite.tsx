import { useMetadata, useTarget } from '@builder.io/mitosis';
import { filterAttrs } from '../../helpers.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */

import { setAttrs } from '../../helpers.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

export default function SubmitButton(props: ButtonProps) {
  return (
    <button
      {...useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', false),
        svelte: filterAttrs(props.attributes, 'on:', false),
        default: {},
      })}
      {...useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', true),
        svelte: filterAttrs(props.attributes, 'on:', true),
        default: props.attributes,
      })}
      type="submit"
    >
      {props.text}
    </button>
  );
}
