import { Show } from "solid-js";

import { css } from "solid-styled-components";

import { filterAttrs } from "../helpers.js";

function Button(props) {
  return (
    <Show
      fallback={
        <button
          class={
            props.attributes.class +
            " " +
            css({
              all: "unset",
            })
          }
          {...{}}
          {...props.attributes}
          style={props.attributes.style}
        >
          {props.text}
        </button>
      }
      when={props.link}
    >
      <a
        role="button"
        {...{}}
        {...props.attributes}
        href={props.link}
        target={props.openLinkInNewTab ? "_blank" : undefined}
      >
        {props.text}
      </a>
    </Show>
  );
}

export default Button;
