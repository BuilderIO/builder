'use client';
import * as React from "react";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface ButtonProps {
  attributes?: any;
  text?: string;
}

import { filterAttrs } from "../helpers";
import { setAttrs } from "../helpers";

function SubmitButton(props: ButtonProps) {
  const _context = { ...props["_context"] };

  return (
    <button type="submit" {...{}} {...props.attributes}>
      {props.text}
    </button>
  );
}

export default SubmitButton;
