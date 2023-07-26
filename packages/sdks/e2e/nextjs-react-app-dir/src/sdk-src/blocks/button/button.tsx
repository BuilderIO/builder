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
            className={'builder-button ' + props.attributes.className}
          >
            {props.text}
          </button>
        </>
      )}
    </>
  );
}

export default Button;
