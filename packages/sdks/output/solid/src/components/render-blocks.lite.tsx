import { Show, For } from "solid-js";

import { createMutable } from "solid-js/store";
import { css } from "solid-styled-components";

import { isEditing } from "../functions/is-editing.js";
import RenderBlock from "./render-block/render-block.lite";

function RenderBlocks(props) {
  const state = createMutable({
    get className() {
      return "builder-blocks" + (!props.blocks?.length ? " no-blocks" : "");
    },
    onClick() {
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
    },
    onMouseEnter() {
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
    },
  });

  return (
    <div
      class={
        state.className +
        " " +
        css({
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        })
      }
      builder-path={props.path}
      builder-parent-id={props.parent}
      dataSet={{
        class: state.className,
      }}
      onClick={(event) => state.onClick()}
      onMouseEnter={(event) => state.onMouseEnter()}
    >
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block, _index) => {
            const index = _index();
            return <RenderBlock key={block.id} block={block}></RenderBlock>;
          }}
        </For>
      </Show>
    </div>
  );
}

export default RenderBlocks;
