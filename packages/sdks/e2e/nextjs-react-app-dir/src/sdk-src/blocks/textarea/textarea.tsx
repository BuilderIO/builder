"use client";
import * as React from "react";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface TextareaProps {
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
}

import { filterAttrs } from "../helpers.js";
import { setAttrs } from "../helpers.js";

function Textarea(props: TextareaProps) {
  return (
    <textarea
      {...{}}
      {...props.attributes}
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
    />
  );
}

export default Textarea;
