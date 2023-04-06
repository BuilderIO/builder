import { isEditing } from "../../functions/is-editing.js";

import { Fragment, component$, h } from "@builder.io/qwik";

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
      {...props.attributes}
      value={props.value}
      key={
        isEditing() && props.defaultValue ? props.defaultValue : "default-key"
      }
      defaultValue={props.defaultValue}
      name={props.name}
    >
      {(props.options || []).map(function (option) {
        return (
          <option value={option.value}>{option.name || option.value}</option>
        );
      })}
    </select>
  );
});

export default SelectComponent;
