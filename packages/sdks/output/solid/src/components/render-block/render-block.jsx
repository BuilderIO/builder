import { useContext, Show, For } from "solid-js";
import { Dynamic } from "solid-js/web";
import { createMutable } from "solid-js/store";
import BuilderContext from "../../context/builder.context";
import { getBlockActions } from "../../functions/get-block-actions.js";
import { getBlockComponentOptions } from "../../functions/get-block-component-options.js";
import { getBlockProperties } from "../../functions/get-block-properties.js";
import { getBlockStyles } from "../../functions/get-block-styles.js";
import { getBlockTag } from "../../functions/get-block-tag.js";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import BlockStyles from "./block-styles";
import { isEmptyHtmlElement } from "./render-block.helpers.js";
import RenderComponent from "./render-component";

function RenderBlock(props) {
  const state = createMutable({
    get component() {
      const componentName = state.useBlock.component?.name;

      if (!componentName) {
        return null;
      }

      const ref = builderContext.registeredComponents[componentName];

      if (!ref) {
        // TODO: Public doc page with more info about this message
        console.warn(`
        Could not find a registered component named "${componentName}". 
        If you registered it, is the file that registered it imported by the file that needs to render it?`);
        return undefined;
      } else {
        return ref;
      }
    },

    get componentInfo() {
      if (state.component) {
        const {
          component: _,
          ...info
        } = state.component;
        return info;
      } else {
        return undefined;
      }
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

    get attributes() {
      return { ...getBlockProperties(state.useBlock),
        ...getBlockActions({
          block: state.useBlock,
          state: builderContext.state,
          context: builderContext.context
        }),
        style: getBlockStyles(state.useBlock)
      };
    },

    get shouldWrap() {
      return !state.componentInfo?.noWrap;
    },

    get componentOptions() {
      return { ...getBlockComponentOptions(state.useBlock),

        /**
         * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
         * they are provided to the component itself directly.
         */
        ...(state.shouldWrap ? {} : {
          attributes: state.attributes
        })
      };
    },

    get children() {
      // TO-DO: When should `canHaveChildren` dictate rendering?
      // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
      // but still receive and need to render children.
      // return state.componentInfo?.canHaveChildren ? state.useBlock.children : [];
      return state.useBlock.children ?? [];
    },

    get noCompRefChildren() {
      /**
       * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
       * we render them outside of `componentRef`
       */
      return state.componentRef ? [] : state.children;
    }

  });
  const builderContext = useContext(BuilderContext);
  return <Show fallback={<RenderComponent blockChildren={state.children} componentRef={state.componentRef} componentOptions={state.componentOptions}></RenderComponent>} when={state.shouldWrap}>
      <Show fallback={<Dynamic {...state.attributes} component={state.tagName}></Dynamic>} when={!isEmptyHtmlElement(state.tagName)}>
        <Dynamic {...state.attributes} component={state.tagName}>
          <RenderComponent blockChildren={state.children} componentRef={state.componentRef} componentOptions={state.componentOptions}></RenderComponent>
          <For each={state.noCompRefChildren}>
            {(child, _index) => {
            const index = _index();

            return <RenderBlock key={"render-block-" + child.id} block={child}></RenderBlock>;
          }}
          </For>
          <For each={state.noCompRefChildren}>
            {(child, _index) => {
            const index = _index();

            return <BlockStyles key={"block-style-" + child.id} block={child}></BlockStyles>;
          }}
          </For>
        </Dynamic>
      </Show>
    </Show>;
}

export default RenderBlock;