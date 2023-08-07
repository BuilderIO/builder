<script context="module" lang="ts">
  export type BlocksWrapperProps = {
    blocks: BuilderBlock[] | undefined;
    parent: string | undefined;
    path: string | undefined;
    styleProp: Record<string, any> | undefined;
  };
</script>

<script lang="ts">
  import { isEditing } from "../../functions/is-editing.js";
  import type { BuilderBlock } from "../../types/builder-block.js";
  import type { PropsWithChildren } from "../../types/typescript.js";

  export let blocks: PropsWithChildren<BlocksWrapperProps>["blocks"];
  export let parent: PropsWithChildren<BlocksWrapperProps>["parent"];
  export let path: PropsWithChildren<BlocksWrapperProps>["path"];
  export let styleProp: PropsWithChildren<BlocksWrapperProps>["styleProp"];

  function mitosis_styling(node, vars) {
    Object.entries(vars || {}).forEach(([p, v]) => {
      if (p.startsWith("--")) {
        node.style.setProperty(p, v);
      } else {
        node.style[p] = v;
      }
    });
  }

  function onClick() {
    if (isEditing() && !blocks?.length) {
      window.parent?.postMessage(
        {
          type: "builder.clickEmptyBlocks",
          data: {
            parentElementId: parent,
            dataPath: path,
          },
        },
        "*"
      );
    }
  }
  function onMouseEnter() {
    if (isEditing() && !blocks?.length) {
      window.parent?.postMessage(
        {
          type: "builder.hoverEmptyBlocks",
          data: {
            parentElementId: parent,
            dataPath: path,
          },
        },
        "*"
      );
    }
  }
  $: className = () => {
    return "builder-blocks" + (!blocks?.length ? " no-blocks" : "");
  };
</script>

<div
  use:mitosis_styling={styleProp}
  class={className() + " div"}
  builder-path={path}
  builder-parent-id={parent}
  {...{}}
  on:click={(event) => {
    onClick();
  }}
  on:mouseenter={(event) => {
    onMouseEnter();
  }}
  on:keypress={(event) => {
    onClick();
  }}
>
  <slot />
</div>

<style>
  .div {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
</style>