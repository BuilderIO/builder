'use client';
import * as React from 'react';
import { useEffect } from 'react';
import type { BuilderContextInterface, RegisteredComponents } from '../../context/types.js';
import { getBlockComponentOptions } from '../../functions/get-block-component-options.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import { bindAnimations } from './animator.js';
import {
  getComponent,
  getRepeatItemData,
  shouldPassLinkComponent,
  shouldPassRegisteredComponents,
} from './block.helpers.js';
import BlockStyles from './components/block-styles';
import BlockWrapper from './components/block-wrapper';
import ComponentRef from './components/component-ref/component-ref';
import RepeatedBlock from './components/repeated-block';

export type BlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
  linkComponent: any;
};

function Block(props: BlockProps) {
  const blockComponent = React.useMemo(() => {
    return getComponent({
      block: props.block,
      context: props.context,
      registeredComponents: props.registeredComponents,
    });
  }, [props.block, props.context, props.registeredComponents]);

  const repeatItem = React.useMemo(() => {
    const newLocal = getRepeatItemData({
      block: props.block,
      context: props.context,
    });
    // console.log('repeatItem', newLocal);
    return newLocal;
  }, [props.block, props.context]);

  const processedBlock = React.useMemo(() => {
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
  }, [
    props.block,
    props.context.localState,
    props.context.rootState,
    props.context.rootSetState,
    props.context.context,
  ]);

  function Tag() {
    const shouldUseLink =
      props.block.tagName === 'a' || processedBlock.properties?.href || processedBlock.href;
    if (shouldUseLink) {
      return props.linkComponent || 'a';
    }
    return props.block.tagName || 'div';
  }

  function canShowBlock() {
    if (props.block.repeat?.collection) {
      if (repeatItem?.length) return true;
      return false;
    }
    const shouldHide = 'hide' in processedBlock ? processedBlock.hide : false;
    const shouldShow = 'show' in processedBlock ? processedBlock.show : true;
    return shouldShow && !shouldHide;
  }

  function childrenWithoutParentComponent() {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`.
     * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
     * blocks, and the children will be repeated within those blocks.
     */
    const shouldRenderChildrenOutsideRef = !blockComponent?.component && !repeatItem;
    return shouldRenderChildrenOutsideRef ? processedBlock.children ?? [] : [];
  }

  function componentRefProps() {
    return {
      blockChildren: processedBlock.children ?? [],
      componentRef: blockComponent?.component,
      componentOptions: {
        ...getBlockComponentOptions(processedBlock),
        builderContext: props.context,
        ...(shouldPassLinkComponent(blockComponent)
          ? {
              builderLinkComponent: props.linkComponent,
            }
          : {}),
        ...(shouldPassRegisteredComponents(blockComponent)
          ? {
              builderComponents: props.registeredComponents,
            }
          : {}),
      },
      context: props.context,
      linkComponent: props.linkComponent,
      registeredComponents: props.registeredComponents,
      builderBlock: processedBlock,
      includeBlockProps: blockComponent?.noWrap === true,
      isInteractive: !blockComponent?.isRSC,
    };
  }

  useEffect(() => {
    const blockId = processedBlock.id;
    const animations = processedBlock.animations;
    if (animations && blockId) {
      bindAnimations(
        animations.map(animation => ({
          ...animation,
          elementId: blockId,
        }))
      );
    }
  }, []);

  return (
    <>
      {/* <div>
        {' '}
        in block:
        <div>
          number of articles:{' '}
          {JSON.stringify(props.context.rootState?.blogArticle?.results?.length)}
        </div>
        <div>
          number of categories:{' '}
          {JSON.stringify(props.context.rootState?.blogCategory?.results?.length)}
        </div>
      </div> */}
      {canShowBlock() ? (
        <>
          <BlockStyles block={props.block} context={props.context} />
          {!blockComponent?.noWrap ? (
            <>
              {!repeatItem ? (
                <>
                  <BlockWrapper
                    Wrapper={Tag()}
                    block={processedBlock}
                    context={props.context}
                    linkComponent={props.linkComponent}
                  >
                    <ComponentRef
                      componentRef={componentRefProps().componentRef}
                      componentOptions={componentRefProps().componentOptions}
                      blockChildren={componentRefProps().blockChildren}
                      context={componentRefProps().context}
                      registeredComponents={componentRefProps().registeredComponents}
                      linkComponent={componentRefProps().linkComponent}
                      builderBlock={componentRefProps().builderBlock}
                      includeBlockProps={componentRefProps().includeBlockProps}
                      isInteractive={componentRefProps().isInteractive}
                    />

                    {childrenWithoutParentComponent()?.map(child => (
                      <Block
                        key={child.id}
                        block={child}
                        registeredComponents={props.registeredComponents}
                        linkComponent={props.linkComponent}
                        context={props.context}
                      />
                    ))}
                  </BlockWrapper>
                </>
              ) : (
                <>
                  {repeatItem?.map((data, index) => (
                    <RepeatedBlock
                      key={index}
                      repeatContext={data.context}
                      block={data.block}
                      registeredComponents={props.registeredComponents}
                      linkComponent={props.linkComponent}
                    />
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <ComponentRef
                componentRef={componentRefProps().componentRef}
                componentOptions={componentRefProps().componentOptions}
                blockChildren={componentRefProps().blockChildren}
                context={componentRefProps().context}
                registeredComponents={componentRefProps().registeredComponents}
                linkComponent={componentRefProps().linkComponent}
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
