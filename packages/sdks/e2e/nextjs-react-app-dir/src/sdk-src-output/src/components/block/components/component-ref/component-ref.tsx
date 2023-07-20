'use client';
import * as React from "react";
import BlockStyles from "../block-styles";
import Block from "../../block";
import InteractiveElement from "../interactive-element";
import type { ComponentProps } from "./component-ref.helpers";
import { getWrapperProps } from "./component-ref.helpers";

function ComponentRef(props: ComponentProps) {
  const _context = { ...props["_context"] };

  const state = {
    get Wrapper() {
      return props.isInteractive ? InteractiveElement : props.componentRef;
    },
  };

  return (
    <>
      {props.componentRef ? (
        <>
          <state.Wrapper
            {...getWrapperProps({
              componentOptions: props.componentOptions,
              builderBlock: props.builderBlock,
              context: props.context,
              componentRef: props.componentRef,
              includeBlockProps: props.includeBlockProps,
              isInteractive: props.isInteractive,
              contextValue: props.context,
            })}
            _context={_context}
          >
            {props.blockChildren?.map((child) => (
              <Block
                key={"block-" + child.id}
                block={child}
                context={props.context}
                registeredComponents={props.registeredComponents}
                _context={_context}
              />
            ))}

            {props.blockChildren?.map((child) => (
              <BlockStyles
                key={"block-style-" + child.id}
                block={child}
                context={props.context}
                _context={_context}
              />
            ))}
          </state.Wrapper>
        </>
      ) : null}
    </>
  );
}

export default ComponentRef;
