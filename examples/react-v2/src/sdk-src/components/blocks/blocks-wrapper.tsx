"use client";
import * as React from "react";

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
  /**
   * The element that wraps each list of blocks. Defaults to a `div` element ('ScrollView' in React Native).
   */
  BlocksWrapper: any;
  /**
   * Additonal props to pass to `blocksWrapper`. Defaults to `{}`.
   */
  BlocksWrapperProps: any;
  children?: any;
};
import { isEditing } from "../../functions/is-editing.js";
import type { BuilderBlock } from "../../types/builder-block.js";

function BlocksWrapper(props: BlocksWrapperProps) {
  function className() {
    return "builder-blocks" + (!props.blocks?.length ? " no-blocks" : "");
  }

  function onClick() {
    if (isEditing() && !props.blocks?.length) {
      window.parent?.postMessage(
        {
          type: "builder.clickEmptyBlocks",
          data: {
            parentElementId: props.parent,
            dataPath: props.path,
          },
        },
        "*"
      );
    }
  }

  function onMouseEnter() {
    if (isEditing() && !props.blocks?.length) {
      window.parent?.postMessage(
        {
          type: "builder.hoverEmptyBlocks",
          data: {
            parentElementId: props.parent,
            dataPath: props.path,
          },
        },
        "*"
      );
    }
  }

  return (
    <>
      <props.BlocksWrapper
        className={className() + " props-blocks-wrapper-7354e098"}
        builder-path={props.path}
        builder-parent-id={props.parent}
        {...{}}
        style={props.styleProp}
        onClick={(event) => onClick()}
        onMouseEnter={(event) => onMouseEnter()}
        onKeyPress={(event) => onClick()}
        {...props.BlocksWrapperProps}
      >
        {props.children}
      </props.BlocksWrapper>

      <style>{`.props-blocks-wrapper-7354e098 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  );
}

export default BlocksWrapper;
