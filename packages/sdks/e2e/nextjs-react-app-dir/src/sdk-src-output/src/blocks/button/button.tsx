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

import { filterAttrs } from "../helpers";
import { setAttrs } from "../helpers";

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
            className={props.attributes.class + " button-4c426b0d"}
          >
            {props.text}
          </button>
        </>
      )}

      <style>{`.button-4c426b0d {
  all: unset;
}`}</style>
    </>
  );
}

export default Button;
