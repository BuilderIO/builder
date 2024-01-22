import * as React from "react";
import { filterAttrs } from "../helpers.js";
import { setAttrs } from "../helpers.js";
import type { ButtonProps } from "./button.types.js";

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
            className={props.attributes.className + " button-fdf49de0"}
          >
            {props.text}
          </button>
        </>
      )}

      <style>{`.button-fdf49de0 {
  all: unset;
}`}</style>
    </>
  );
}

export default Button;
