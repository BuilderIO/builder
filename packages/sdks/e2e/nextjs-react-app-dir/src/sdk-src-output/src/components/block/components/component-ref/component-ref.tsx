'use client';
import * as React from "react";
import BlockStyles from "../block-styles";
import Block from "../../block";
import InteractiveElement from "../interactive-element";
import type { ComponentProps } from "./component-ref.helpers";
import { getWrapperProps } from "./component-ref.helpers";

function ComponentRef(props: ComponentProps) {
  function Wrapper() {
    return props.isInteractive ? InteractiveElement : props.componentRef;
  }

  const WrapperRef = Wrapper();

  return (
    <>
      {props.componentRef ? (
        <>
          <WrapperRef
            {...getWrapperProps({
              componentOptions: props.componentOptions,
              builderBlock: props.builderBlock,
              context: props.context,
              componentRef: props.componentRef,
              includeBlockProps: props.includeBlockProps,
              isInteractive: props.isInteractive,
              contextValue: props.context,
            })}
          >
            {props.blockChildren?.map((child) => (
              <Block
                key={"block-" + child.id}
                block={child}
                context={props.context}
                registeredComponents={props.registeredComponents}
              />
            ))}

            {props.blockChildren?.map((child) => (
              <BlockStyles
                key={"block-style-" + child.id}
                block={child}
                context={props.context}
              />
            ))}
          </WrapperRef>
        </>
      ) : null}
    </>
  );
}

export default ComponentRef;
