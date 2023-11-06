import { createSignal } from "solid-js";

import { css } from "solid-styled-components";

import { isEditing } from "../../functions/is-editing.js";

function BlocksWrapper(props) {
  function className() {
    return "builder-blocks" + (!props.blocks?.length ? " no-blocks" : "");
  }

  function onClick() {
    if (isEditing() && !props.blocks?.length) {
      window.parent?.postMessage(
        {
          type: "builder.clickEmptyBlocks",
          data: {
            parentElementId: props.parent,
            dataPath: props.path,
          },
        },
        "*"
      );
    }
  }

  function onMouseEnter() {
    if (isEditing() && !props.blocks?.length) {
      window.parent?.postMessage(
        {
          type: "builder.hoverEmptyBlocks",
          data: {
            parentElementId: props.parent,
            dataPath: props.path,
          },
        },
        "*"
      );
    }
  }

  return (
    <div
      class={
        className() +
        " " +
        css({
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        })
      }
      builder-path={props.path}
      builder-parent-id={props.parent}
      {...{}}
      style={props.styleProp}
      onClick={(event) => onClick()}
      onMouseEnter={(event) => onMouseEnter()}
      onKeyPress={(event) => onClick()}
    >
      {props.children}
    </div>
  );
}

export default BlocksWrapper;
