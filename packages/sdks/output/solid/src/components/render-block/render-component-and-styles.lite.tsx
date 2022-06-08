import { Show, For } from "solid-js";
import { Dynamic } from "solid-js/web";

import { TARGET } from "../../constants/target.js";
import BlockStyles from "./block-styles.lite";
import RenderBlock from "./render-block.lite";

function RenderComponentAndStyles(props) {
  return (
    <>
      <Show when={TARGET === "vue" || TARGET === "svelte"}>
        <BlockStyles block={props.block}></BlockStyles>
      </Show>
      <Show when={props.componentRef}>
        <Dynamic {...props.componentOptions} component={props.componentRef}>
          <For each={props.blockChildren}>
            {(child, _index) => {
              const index = _index();
              return <RenderBlock key={child.id} block={child}></RenderBlock>;
            }}
          </For>
        </Dynamic>
      </Show>
    </>
  );
}

export default RenderComponentAndStyles;
