'use client';
import * as React from "react";

export type BlocksProps = Partial<BlocksWrapperProps> & {
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};
import BlockStyles from "../block/components/block-styles";
import Block from "../block/block";
import type { BlocksWrapperProps } from "./blocks-wrapper";
import BlocksWrapper from "./blocks-wrapper";
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from "../../context/types";

function Blocks(props: BlocksProps) {
  const _context = { ...props["_context"] };

  return (
    <BlocksWrapper
      blocks={props.blocks}
      parent={props.parent}
      path={props.path}
      styleProp={props.styleProp}
      _context={_context}
    >
      {props.blocks ? (
        <>
          {props.blocks?.map((block) => (
            <Block
              key={"render-block-" + block.id}
              block={block}
              context={props.context}
              registeredComponents={props.registeredComponents}
              _context={_context}
            />
          ))}
        </>
      ) : null}

      {props.blocks ? (
        <>
          {props.blocks?.map((block) => (
            <BlockStyles
              key={"block-style-" + block.id}
              block={block}
              context={props.context}
              _context={_context}
            />
          ))}
        </>
      ) : null}
    </BlocksWrapper>
  );
}

export default Blocks;
