"use client";
import * as React from "react";
import { useContext } from "react";
import BuilderContext from "../../context/builder.context.js";
import ComponentsContext from "../../context/components.context.js";
import Block from "../block/block";
import BlocksWrapper from "./blocks-wrapper";
import type { BlocksProps } from "./blocks.types.js";

function Blocks(props: BlocksProps) {
  const builderContext = useContext(BuilderContext);

  const componentsContext = useContext(ComponentsContext);

  return (
    <BlocksWrapper
      blocks={props.blocks}
      parent={props.parent}
      path={props.path}
      styleProp={props.styleProp}
      BlocksWrapper={
        props.context?.BlocksWrapper || builderContext.BlocksWrapper
      }
      BlocksWrapperProps={
        props.context?.BlocksWrapperProps || builderContext.BlocksWrapperProps
      }
    >
      {props.blocks ? (
        <>
          {props.blocks?.map((block) => (
            <Block
              key={block.id}
              block={block}
              linkComponent={props.linkComponent}
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
