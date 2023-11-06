import { Dynamic } from "solid-js/web";

import { getBlockActions } from "../../../functions/get-block-actions.js";
import { getBlockProperties } from "../../../functions/get-block-properties.js";

function InteractiveElement(props) {
  return (
    <Dynamic
      {...props.wrapperProps}
      attributes={{
        ...getBlockProperties({
          block: props.block,
          context: props.context,
        }),
        ...getBlockActions({
          block: props.block,
          rootState: props.context.rootState,
          rootSetState: props.context.rootSetState,
          localState: props.context.localState,
          context: props.context.context,
        }),
      }}
      component={props.Wrapper}
    >
      {props.children}
    </Dynamic>
  );
}

export default InteractiveElement;
