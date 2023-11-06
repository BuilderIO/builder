import { Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import { getBlockActions } from "../../../functions/get-block-actions.js";
import { getBlockProperties } from "../../../functions/get-block-properties.js";

function BlockWrapper(props) {
  return (
    <Show
      fallback={
        <Dynamic
          {...getBlockProperties({
            block: props.block,
            context: props.context,
          })}
          {...getBlockActions({
            block: props.block,
            rootState: props.context.rootState,
            rootSetState: props.context.rootSetState,
            localState: props.context.localState,
            context: props.context.context,
            stripPrefix: true,
          })}
          component={props.Wrapper}
        ></Dynamic>
      }
      when={props.hasChildren}
    >
      <Dynamic
        {...getBlockProperties({
          block: props.block,
          context: props.context,
        })}
        {...getBlockActions({
          block: props.block,
          rootState: props.context.rootState,
          rootSetState: props.context.rootSetState,
          localState: props.context.localState,
          context: props.context.context,
          stripPrefix: true,
        })}
        component={props.Wrapper}
      >
        {props.children}
      </Dynamic>
    </Show>
  );
}

export default BlockWrapper;
