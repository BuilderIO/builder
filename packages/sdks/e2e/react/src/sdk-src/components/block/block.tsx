"use client";
import * as React from "react";
import { useState } from "react";

export type BlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from "../../context/types.js";
import { extractTextStyles } from "../../functions/extract-text-styles.js";
import { getBlockComponentOptions } from "../../functions/get-block-component-options.js";
import { getBlockProperties } from "../../functions/get-block-properties.js";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import type { BuilderBlock } from "../../types/builder-block.js";
import {
  getComponent,
  getRepeatItemData,
  isEmptyHtmlElement,
} from "./block.helpers.js";
import BlockStyles from "./components/block-styles";
import BlockWrapper from "./components/block-wrapper";
import type { ComponentProps } from "./components/component-ref/component-ref.helpers.js";
import ComponentRef from "./components/component-ref/component-ref";
import RepeatedBlock from "./components/repeated-block";

function Block(props: BlockProps) {
  function blockComponent() {
    return getComponent({
      block: props.block,
      context: props.context,
      registeredComponents: props.registeredComponents,
    });
  }

  function repeatItem() {
    return getRepeatItemData({
      block: props.block,
      context: props.context,
    });
  }

  function processedBlock() {
    return props.block.repeat?.collection
      ? props.block
      : getProcessedBlock({
          block: props.block,
          localState: props.context.localState,
          rootState: props.context.rootState,
          rootSetState: props.context.rootSetState,
          context: props.context.context,
          shouldEvaluateBindings: true,
        });
  }

  function Tag() {
    return props.block.tagName || "div";
  }

  function canShowBlock() {
    if (props.block.repeat?.collection) {
      if (repeatItem?.()?.length) return true;
      return false;
    }
    const shouldHide =
      "hide" in processedBlock() ? processedBlock().hide : false;
    const shouldShow =
      "show" in processedBlock() ? processedBlock().show : true;
    return shouldShow && !shouldHide;
  }

  function childrenWithoutParentComponent() {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`.
     * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
     * blocks, and the children will be repeated within those blocks.
     */
    const shouldRenderChildrenOutsideRef =
      !blockComponent?.()?.component && !repeatItem();
    return shouldRenderChildrenOutsideRef
      ? processedBlock().children ?? []
      : [];
  }

  function componentRefProps() {
    return {
      blockChildren: processedBlock().children ?? [],
      componentRef: blockComponent?.()?.component,
      componentOptions: {
        ...getBlockComponentOptions(processedBlock()),
        builderContext: props.context,
        ...(blockComponent?.()?.name === "Symbol" ||
        blockComponent?.()?.name === "Columns"
          ? {
              builderComponents: props.registeredComponents,
            }
          : {}),
      },
      context: childrenContext,
      registeredComponents: props.registeredComponents,
      builderBlock: processedBlock(),
      includeBlockProps: blockComponent?.()?.noWrap === true,
      isInteractive: !blockComponent?.()?.isRSC,
    };
  }

  const [childrenContext, setChildrenContext] = useState(() => props.context);

  return (
    <>
      {canShowBlock() ? (
        <>
          <BlockStyles block={props.block} context={props.context} />
          {!blockComponent?.()?.noWrap ? (
            <>
              {isEmptyHtmlElement(Tag()) ? (
                <>
                  <BlockWrapper
                    Wrapper={Tag()}
                    block={processedBlock()}
                    context={props.context}
                    hasChildren={false}
                  />
                </>
              ) : null}
              {!isEmptyHtmlElement(Tag()) && repeatItem() ? (
                <>
                  {repeatItem()?.map((data, index) => (
                    <RepeatedBlock
                      key={index}
                      repeatContext={data.context}
                      block={data.block}
                      registeredComponents={props.registeredComponents}
                    />
                  ))}
                </>
              ) : null}
              {!isEmptyHtmlElement(Tag()) && !repeatItem() ? (
                <>
                  <BlockWrapper
                    Wrapper={Tag()}
                    block={processedBlock()}
                    context={props.context}
                    hasChildren={true}
                  >
                    <ComponentRef
                      componentRef={componentRefProps().componentRef}
                      componentOptions={componentRefProps().componentOptions}
                      blockChildren={componentRefProps().blockChildren}
                      context={componentRefProps().context}
                      registeredComponents={
                        componentRefProps().registeredComponents
                      }
                      builderBlock={componentRefProps().builderBlock}
                      includeBlockProps={componentRefProps().includeBlockProps}
                      isInteractive={componentRefProps().isInteractive}
                    />

                    {childrenWithoutParentComponent()?.map((child) => (
                      <Block
                        key={child.id}
                        block={child}
                        context={childrenContext}
                        registeredComponents={props.registeredComponents}
                      />
                    ))}
                  </BlockWrapper>
                </>
              ) : null}
            </>
          ) : (
            <>
              <ComponentRef
                componentRef={componentRefProps().componentRef}
                componentOptions={componentRefProps().componentOptions}
                blockChildren={componentRefProps().blockChildren}
                context={componentRefProps().context}
                registeredComponents={componentRefProps().registeredComponents}
                builderBlock={componentRefProps().builderBlock}
                includeBlockProps={componentRefProps().includeBlockProps}
                isInteractive={componentRefProps().isInteractive}
              />
            </>
          )}
        </>
      ) : null}
    </>
  );
}

export default Block;
