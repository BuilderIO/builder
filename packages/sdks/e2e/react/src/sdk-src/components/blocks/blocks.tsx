"use client";
import * as React from "react";
import { useContext } from "react";

export type BlocksProps = Partial<
  Omit<BlocksWrapperProps, "BlocksWrapper" | "BlocksWrapperProps">
> & {
  context?: BuilderContextInterface;
  registeredComponents?: RegisteredComponents;
};
import BuilderContext from "../../context/builder.context.js";
import ComponentsContext from "../../context/components.context.js";
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from "../../context/types.js";
import Block from "../block/block";
import type { BlocksWrapperProps } from "./blocks-wrapper";
import BlocksWrapper from "./blocks-wrapper";

function Blocks(props: BlocksProps) {
  const builderContext = useContext(BuilderContext);

  const componentsContext = useContext(ComponentsContext);

  return (
    <BlocksWrapper
      blocks={props.blocks}
      parent={props.parent}
      path={props.path}
      styleProp={props.styleProp}
      BlocksWrapper={props.context?.BlocksWrapper}
      BlocksWrapperProps={props.context?.BlocksWrapperProps}
    >
      {props.blocks ? (
        <>
          {props.blocks?.map((block) => (
            <Block
              key={block.id}
              block={block}
              context={props.context || builderContext}
              registeredComponents={
                props.registeredComponents ||
                componentsContext.registeredComponents
              }
            />
          ))}
        </>
      ) : null}
    </BlocksWrapper>
  );
}

export default Blocks;
