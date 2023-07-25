"use client";
import * as React from "react";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}

import { filterAttrs } from "../helpers.js";
import { setAttrs } from "../helpers.js";

function Button(props: ButtonProps) {
  return (
    <>
      {props.link ? (
        <>
          <a
            role="button"
            {...{}}
            {...props.attributes}
            href={props.link}
            target={props.openLinkInNewTab ? "_blank" : undefined}
          >
            {props.text}
          </a>
        </>
      ) : (
        <>
          <button
            {...{}}
            {...props.attributes}
            style={props.attributes.style}
            className={props.attributes.class + " button-dca069a6"}
          >
            {props.text}
          </button>
        </>
      )}

      <style>{`.button-dca069a6 {
  all: unset;
}`}</style>
    </>
  );
}

export default Button;
