"use client";
import * as React from "react";
import { useState } from "react";
import { wrapComponentRef } from "../../../content/wrap-component-ref.js";
import Block from "../../block";
import InteractiveElement from "../interactive-element";
import type { ComponentProps } from "./component-ref.helpers.js";
import { getWrapperProps } from "./component-ref.helpers.js";

function ComponentRef(props: ComponentProps) {
  const [Wrapper, setWrapper] = useState(() =>
    props.isInteractive ? InteractiveElement : props.componentRef
  );

  return (
    <>
      {props.componentRef ? (
        <>
          <Wrapper
            {...getWrapperProps({
              componentOptions: props.componentOptions,
              builderBlock: props.builderBlock,
              context: props.context,
              componentRef: props.componentRef,
              linkComponent: props.linkComponent,
              includeBlockProps: props.includeBlockProps,
              isInteractive: props.isInteractive,
              contextValue: props.context,
            })}
          >
            {props.blockChildren?.map((child) => (
              <Block
                key={child.id}
                block={child}
                context={props.context}
                registeredComponents={props.registeredComponents}
                linkComponent={props.linkComponent}
              />
            ))}
          </Wrapper>
        </>
      ) : null}
    </>
  );
}

export default ComponentRef;
