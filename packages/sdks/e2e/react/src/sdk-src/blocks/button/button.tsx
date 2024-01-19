import * as React from "react";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

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
            {...{}}
            {...props.attributes}
            href={props.link}
            target={props.openLinkInNewTab ? "_blank" : undefined}
            role={"button"}
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
            className={props.attributes.className + " button-3ecc5438"}
          >
            {props.text}
          </button>
        </>
      )}

      <style>{`.button-3ecc5438 {
  all: unset;
}`}</style>
    </>
  );
}

export default Button;
