import * as React from "react";

type BlockWrapperProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: BuilderContextInterface;
  linkComponent: any;
  children?: any;
};

/**
 * This component renders a block's wrapper HTML element (from the block's `tagName` property).
 */

import type { BuilderContextInterface } from "../../../context/types.js";
import { getBlockActions } from "../../../functions/get-block-actions.js";
import { getBlockProperties } from "../../../functions/get-block-properties.js";
import type { BuilderBlock } from "../../../types/builder-block.js";
import DynamicRenderer from "../../dynamic-renderer/dynamic-renderer";

function BlockWrapper(props: BlockWrapperProps) {
  return (
    <DynamicRenderer
      TagName={props.Wrapper}
      attributes={getBlockProperties({
        block: props.block,
        context: props.context,
      })}
      actionAttributes={getBlockActions({
        block: props.block,
        rootState: props.context.rootState,
        rootSetState: props.context.rootSetState,
        localState: props.context.localState,
        context: props.context.context,
        stripPrefix: true,
      })}
    >
      {props.children}
    </DynamicRenderer>
  );
}

export default BlockWrapper;
