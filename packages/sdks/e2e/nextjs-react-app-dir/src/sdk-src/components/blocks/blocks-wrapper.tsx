"use client";
import * as React from "react";

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
};
import { isEditing } from "../../functions/is-editing.js";
import type { BuilderBlock } from "../../types/builder-block.js";
import type { PropsWithChildren } from "../../types/typescript.js";

function BlocksWrapper(props: PropsWithChildren<BlocksWrapperProps>) {
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
      <div
        className={className() + " div-b2473120"}
        builder-path={props.path}
        builder-parent-id={props.parent}
        {...{}}
        style={props.styleProp}
        onClick={(event) => onClick()}
        onMouseEnter={(event) => onMouseEnter()}
        onKeyPress={(event) => onClick()}
      >
        {props.children}
      </div>

      <style>{`.div-b2473120 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  );
}

export default BlocksWrapper;
