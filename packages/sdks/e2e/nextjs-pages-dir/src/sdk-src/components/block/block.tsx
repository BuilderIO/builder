'use client';
import * as React from 'react';
import { useState } from 'react';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types';
import { extractTextStyles } from '../../functions/extract-text-styles';
import { getBlockComponentOptions } from '../../functions/get-block-component-options';
import { getBlockProperties } from '../../functions/get-block-properties';
import { getProcessedBlock } from '../../functions/get-processed-block';
import type { BuilderBlock } from '../../types/builder-block';
import {
  getComponent,
  getRepeatItemData,
  isEmptyHtmlElement,
} from './block.helpers';
import BlockStyles from './components/block-styles';
import BlockWrapper from './components/block-wrapper';
import ComponentRef from './components/component-ref/component-ref';
import type { ComponentProps } from './components/component-ref/component-ref.helpers';
import RepeatedBlock from './components/repeated-block';

export type BlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};

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
    return repeatItem()
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
    return props.block.tagName || 'div';
  }

  function canShowBlock() {
    if ('hide' in processedBlock()) {
      return !processedBlock().hide;
    }
    if ('show' in processedBlock()) {
      return processedBlock().show;
    }
    return true;
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
        ...(blockComponent?.()?.name === 'Symbol' ||
        blockComponent?.()?.name === 'Columns'
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
                        key={'block-' + child.id}
                        block={child}
                        context={childrenContext}
                        registeredComponents={props.registeredComponents}
                      />
                    ))}

                    {childrenWithoutParentComponent()?.map((child) => (
                      <BlockStyles
                        key={'block-style-' + child.id}
                        block={child}
                        context={childrenContext}
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
