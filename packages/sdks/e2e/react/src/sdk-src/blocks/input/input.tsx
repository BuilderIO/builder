import * as React from "react";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface FormInputProps {
  type?: string;
  attributes?: any;
  name?: string;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

import { isEditing } from "../../functions/is-editing.js";
import { filterAttrs } from "../helpers.js";
import { setAttrs } from "../helpers.js";

function FormInputComponent(props: FormInputProps) {
  return (
    <input
      {...{}}
      {...props.attributes}
      key={
        isEditing() && props.defaultValue ? props.defaultValue : "default-key"
      }
      placeholder={props.placeholder}
      type={props.type}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
      required={props.required}
    />
  );
}

export default FormInputComponent;
