import { isEditing } from '../../functions/is-editing';

import { filterAttrs, setAttrs } from '../helpers';

import { Fragment, component$, h } from '@builder.io/qwik';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface FormSelectProps {
  options?: {
    name?: string;
    value: string;
  }[];
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
}
export const SelectComponent = component$((props: FormSelectProps) => {
  return (
    <select
      {...{}}
      {...props.attributes}
      value={props.value}
      key={
        isEditing() && props.defaultValue ? props.defaultValue : 'default-key'
      }
      defaultValue={props.defaultValue}
      name={props.name}
    >
      {(props.options || []).map((option) => {
        return (
          <option value={option.value}>{option.name || option.value}</option>
        );
      })}
    </select>
  );
});

export default SelectComponent;
