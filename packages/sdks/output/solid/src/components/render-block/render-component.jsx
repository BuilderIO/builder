import { Show, For } from "solid-js";
import { Dynamic } from "solid-js/web";
import BlockStyles from "./block-styles";
import RenderBlock from "./render-block";

function RenderComponent(props) {
  return <Show when={props.componentRef}>
      <Dynamic {...props.componentOptions} component={props.componentRef}>
        <For each={props.blockChildren}>
          {(child, _index) => {
          const index = _index();

          return <RenderBlock key={"render-block-" + child.id} block={child}></RenderBlock>;
        }}
        </For>
        <For each={props.blockChildren}>
          {(child, _index) => {
          const index = _index();

          return <BlockStyles key={"block-style-" + child.id} block={child}></BlockStyles>;
        }}
        </For>
      </Dynamic>
    </Show>;
}

export default RenderComponent;