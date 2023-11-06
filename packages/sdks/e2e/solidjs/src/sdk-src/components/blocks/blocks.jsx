import { useContext, Show, For } from "solid-js";

import BlockStyles from "../block/components/block-styles";
import Block from "../block/block";
import BlocksWrapper from "./blocks-wrapper";
import BuilderContext from "../../context/builder.context.js";
import ComponentsContext from "../../context/components.context.js";

function Blocks(props) {
  const builderContext = useContext(BuilderContext);

  const componentsContext = useContext(ComponentsContext);

  return (
    <BlocksWrapper
      blocks={props.blocks}
      parent={props.parent}
      path={props.path}
      styleProp={props.styleProp}
    >
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block, _index) => {
            const index = _index();
            return (
              <Block
                key={"render-block-" + block.id}
                block={block}
                context={props.context || builderContext}
                registeredComponents={
                  props.registeredComponents ||
                  componentsContext.registeredComponents
                }
              ></Block>
            );
          }}
        </For>
      </Show>
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block, _index) => {
            const index = _index();
            return (
              <BlockStyles
                key={"block-style-" + block.id}
                block={block}
                context={props.context || builderContext}
              ></BlockStyles>
            );
          }}
        </For>
      </Show>
    </BlocksWrapper>
  );
}

export default Blocks;
