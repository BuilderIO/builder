import { Show, For, createSignal } from "solid-js";
import { Dynamic } from "solid-js/web";

import BlockStyles from "../block-styles";
import Block from "../../block";
import InteractiveElement from "../interactive-element";
import { getWrapperProps } from "./component-ref.helpers.js";
import { wrapComponentRef } from "../../../content/wrap-component-ref.js";

function ComponentRef(props) {
  const [Wrapper, setWrapper] = createSignal(
    props.isInteractive ? InteractiveElement : props.componentRef
  );

  return (
    <Show when={props.componentRef}>
      <Dynamic
        {...getWrapperProps({
          componentOptions: props.componentOptions,
          builderBlock: props.builderBlock,
          context: props.context,
          componentRef: props.componentRef,
          includeBlockProps: props.includeBlockProps,
          isInteractive: props.isInteractive,
          contextValue: props.context,
        })}
        component={Wrapper()}
      >
        <For each={props.blockChildren}>
          {(child, _index) => {
            const index = _index();
            return (
              <Block
                key={"block-" + child.id}
                block={child}
                context={props.context}
                registeredComponents={props.registeredComponents}
              ></Block>
            );
          }}
        </For>
        <For each={props.blockChildren}>
          {(child, _index) => {
            const index = _index();
            return (
              <BlockStyles
                key={"block-style-" + child.id}
                block={child}
                context={props.context}
              ></BlockStyles>
            );
          }}
        </For>
      </Dynamic>
    </Show>
  );
}

export default ComponentRef;
