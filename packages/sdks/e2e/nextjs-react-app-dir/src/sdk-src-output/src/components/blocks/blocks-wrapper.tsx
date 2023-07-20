'use client';
import * as React from "react";

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
};
import { isEditing } from "../../functions/is-editing";
import type { BuilderBlock } from "../../types/builder-block";
import type { PropsWithChildren } from "../../types/typescript";

function BlocksWrapper(props: PropsWithChildren<BlocksWrapperProps>) {
  const _context = { ...props["_context"] };

  const state = {
    get className() {
      return "builder-blocks" + (!props.blocks?.length ? " no-blocks" : "");
    },
    onClick() {
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
    },
    onMouseEnter() {
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
    },
  };

  return (
    <>
      <div
        className={state.className + " div-47a6492a"}
        builder-path={props.path}
        builder-parent-id={props.parent}
        style={props.styleProp}
      >
        {props.children}
      </div>

      <style>{`.div-47a6492a {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  );
}

export default BlocksWrapper;
