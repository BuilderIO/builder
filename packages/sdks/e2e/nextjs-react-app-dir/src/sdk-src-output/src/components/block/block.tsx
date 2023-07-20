'use client';
import * as React from "react";

export type BlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from "../../context/types";
import { getBlockComponentOptions } from "../../functions/get-block-component-options";
import { getBlockProperties } from "../../functions/get-block-properties";
import { getProcessedBlock } from "../../functions/get-processed-block";
import type { BuilderBlock } from "../../types/builder-block";
import BlockStyles from "./components/block-styles";
import {
  getComponent,
  getRepeatItemData,
  isEmptyHtmlElement,
} from "./block.helpers";
import RepeatedBlock from "./components/repeated-block";
import { extractTextStyles } from "../../functions/extract-text-styles";
import ComponentRef from "./components/component-ref/component-ref";
import type { ComponentProps } from "./components/component-ref/component-ref.helpers";
import BlockWrapper from "./components/block-wrapper";

function Block(props: BlockProps) {
  const _context = { ...props["_context"] };

  const state = {
    component: getComponent({
      block: props.block,
      context: props.context,
      registeredComponents: props.registeredComponents,
    }),
    get repeatItem() {
      return getRepeatItemData({
        block: props.block,
        context: props.context,
      });
    },
    get processedBlock() {
      return state.repeatItem
        ? props.block
        : getProcessedBlock({
            block: props.block,
            localState: props.context.localState,
            rootState: props.context.rootState,
            rootSetState: props.context.rootSetState,
            context: props.context.context,
            shouldEvaluateBindings: true,
          });
    },
    Tag: props.block.tagName || "div",
    get canShowBlock() {
      if ("hide" in state.processedBlock) {
        return !state.processedBlock.hide;
      }
      if ("show" in state.processedBlock) {
        return state.processedBlock.show;
      }
      return true;
    },
    get childrenWithoutParentComponent() {
      /**
       * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
       * we render them outside of `componentRef`.
       * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
       * blocks, and the children will be repeated within those blocks.
       */
      const shouldRenderChildrenOutsideRef =
        !state.component?.component && !state.repeatItem;
      return shouldRenderChildrenOutsideRef
        ? state.processedBlock.children ?? []
        : [];
    },
    get componentRefProps() {
      return {
        blockChildren: state.processedBlock.children ?? [],
        componentRef: state.component?.component,
        componentOptions: {
          ...getBlockComponentOptions(state.processedBlock),
          builderContext: props.context,
          ...(state.component?.name === "Symbol" ||
          state.component?.name === "Columns"
            ? {
                builderComponents: props.registeredComponents,
              }
            : {}),
        },
        context: state.childrenContext,
        registeredComponents: props.registeredComponents,
        builderBlock: state.processedBlock,
        includeBlockProps: state.component?.noWrap === true,
        isInteractive: !state.component?.isRSC,
      };
    },
    childrenContext: props.context,
  };

  return (
    <>
      {state.canShowBlock ? (
        <>
          {!state.component?.noWrap ? (
            <>
              {isEmptyHtmlElement(state.Tag) ? (
                <>
                  <BlockWrapper
                    Wrapper={state.Tag}
                    block={state.processedBlock}
                    context={props.context}
                    hasChildren={false}
                    _context={_context}
                  />
                </>
              ) : null}
              {!isEmptyHtmlElement(state.Tag) && state.repeatItem ? (
                <>
                  {state.repeatItem?.map((data, index) => (
                    <RepeatedBlock
                      key={index}
                      repeatContext={data.context}
                      block={data.block}
                      registeredComponents={props.registeredComponents}
                      _context={_context}
                    />
                  ))}
                </>
              ) : null}
              {!isEmptyHtmlElement(state.Tag) && !state.repeatItem ? (
                <>
                  <BlockWrapper
                    Wrapper={state.Tag}
                    block={state.processedBlock}
                    context={props.context}
                    hasChildren={true}
                    _context={_context}
                  >
                    <ComponentRef
                      {...state.componentRefProps}
                      _context={_context}
                    />

                    {state.childrenWithoutParentComponent?.map((child) => (
                      <Block
                        key={"block-" + child.id}
                        block={child}
                        context={state.childrenContext}
                        registeredComponents={props.registeredComponents}
                        _context={_context}
                      />
                    ))}

                    {state.childrenWithoutParentComponent?.map((child) => (
                      <BlockStyles
                        key={"block-style-" + child.id}
                        block={child}
                        context={state.childrenContext}
                        _context={_context}
                      />
                    ))}
                  </BlockWrapper>
                </>
              ) : null}
            </>
          ) : (
            <>
              <ComponentRef {...state.componentRefProps} _context={_context} />
            </>
          )}
        </>
      ) : null}
    </>
  );
}

export default Block;
