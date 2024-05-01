import * as React from "react";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

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

import { isEditing } from "../../../functions/is-editing.js";
import { filterAttrs } from "../../helpers.js";
import { setAttrs } from "../../helpers.js";

function SelectComponent(props: FormSelectProps) {
  return (
    <select
      {...{}}
      {...props.attributes}
      value={props.value}
      key={
        isEditing() && props.defaultValue ? props.defaultValue : "default-key"
      }
      defaultValue={props.defaultValue}
      name={props.name}
    >
      {props.options?.map((option, index) => (
        <option key={`${option.name}-${index}`} value={option.value}>
          {option.name || option.value}
        </option>
      ))}
    </select>
  );
}

export default SelectComponent;
