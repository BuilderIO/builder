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

export interface TextareaProps {
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

export default function Textarea(props: TextareaProps) {
  return (
    <textarea
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
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
      required={props.required}
    />
  );
}
