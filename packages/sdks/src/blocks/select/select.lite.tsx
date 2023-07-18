import { isEditing } from '../../functions/is-editing.js';
import { For, useTarget } from '@builder.io/mitosis';
import { filterVueAttrs } from '../helpers.js';

export interface FormSelectProps {
  options?: { name?: string; value: string }[];
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
}

export default function SelectComponent(props: FormSelectProps) {
  return (
    <select
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
      value={props.value}
      key={
        isEditing() && props.defaultValue ? props.defaultValue : 'default-key'
      }
      defaultValue={props.defaultValue}
      name={props.name}
    >
      <For each={props.options}>
        {(option) => (
          <option value={option.value}>{option.name || option.value}</option>
        )}
      </For>
    </select>
  );
}
