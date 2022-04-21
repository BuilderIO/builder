import { For } from "solid-js";

import { isEditing } from "../functions/is-editing";

export default function SelectComponent(props) {
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
      <For each={props.options}>
        {(option, index) => (
          <option value={option.value}>{option.name || option.value}</option>
        )}
      </For>
    </select>
  );
}
