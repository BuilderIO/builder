import { useContext, Show, For } from "solid-js";
import { Dynamic } from "solid-js/web";
import { createMutable } from "solid-js/store";
import { getBlockComponentOptions } from "../functions/get-block-component-options";
import { getBlockProperties } from "../functions/get-block-properties";
import { getBlockStyles } from "../functions/get-block-styles";
import { getBlockTag } from "../functions/get-block-tag";
import { components } from "../functions/register-component";
import BuilderContext from "../context/builder.context";
import { getBlockActions } from "../functions/get-block-actions";
import { getProcessedBlock } from "../functions/get-processed-block";
import BlockStyles from "./block-styles";

function RenderBlock(props) {
  const state = createMutable({
    get component() {
      const componentName = state.useBlock.component?.name;

      if (!componentName) {
        return null;
      }

      const ref = components[state.useBlock.component?.name];

      if (componentName && !ref) {
        // TODO: Public doc page with more info about this message
        console.warn(`
        Could not find a registered component named "${componentName}". 
        If you registered it, is the file that registered it imported by the file that needs to render it?`);
      }

      return ref;
    },

    get componentInfo() {
      return state.component?.info;
    },

    get componentRef() {
      return state.component?.component;
    },

    get tagName() {
      return getBlockTag(state.useBlock);
    },

    get useBlock() {
      return getProcessedBlock({
        block: props.block,
        state: builderContext.state,
        context: builderContext.context
      });
    },

    get propertiesAndActions() {
      return { ...getBlockProperties(state.useBlock),
        ...getBlockActions({
          block: state.useBlock,
          state: builderContext.state,
          context: builderContext.context
        })
      };
    },

    get css() {
      return getBlockStyles(state.useBlock);
    },

    get componentOptions() {
      return getBlockComponentOptions(state.useBlock);
    },

    get children() {
      // TO-DO: When should `canHaveChildren` dictate rendering?
      // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
      // but still receive and need to render children.
      // return state.componentInfo?.canHaveChildren ? state.useBlock.children : [];
      return state.useBlock.children ?? [];
    },

    get noCompRefChildren() {
      return state.componentRef ? [] : state.children;
    }

  });
  const builderContext = useContext(BuilderContext);
  return <>
      <Show when={!state.componentInfo?.noWrap}>
        <Dynamic {...state.propertiesAndActions} style={state.css} component={state.tagName}>
          <BlockStyles block={state.useBlock}></BlockStyles>
          <Show when={state.componentRef}>
            <Dynamic {...state.componentOptions} builderBlock={state.useBlock} component={state.componentRef}>
              <For each={state.children}>
                {(child, _index) => {
                const index = _index();

                return <RenderBlock block={child}></RenderBlock>;
              }}
              </For>
            </Dynamic>
          </Show>
          <For each={state.noCompRefChildren}>
            {(child, _index) => {
            const index = _index();

            return <RenderBlock block={child}></RenderBlock>;
          }}
          </For>
        </Dynamic>
      </Show>
    </>;
}

export default RenderBlock;