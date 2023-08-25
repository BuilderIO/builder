import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types';

import { getBlockComponentOptions } from '../../functions/get-block-component-options';

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

import RepeatedBlock from './components/repeated-block';

import { component$, useComputed$, useStore } from '@builder.io/qwik';

export type BlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};
export const Block = component$((props: BlockProps) => {
  const state = useStore<any>({ childrenContext: props.context });
  const blockComponent = useComputed$(() => {
    return getComponent({
      block: props.block,
      context: props.context,
      registeredComponents: props.registeredComponents,
    });
  });
  const repeatItem = useComputed$(() => {
    return getRepeatItemData({
      block: props.block,
      context: props.context,
    });
  });
  const processedBlock = useComputed$(() => {
    return repeatItem.value
      ? props.block
      : getProcessedBlock({
          block: props.block,
          localState: props.context.localState,
          rootState: props.context.rootState,
          rootSetState: props.context.rootSetState,
          context: props.context.context,
          shouldEvaluateBindings: true,
        });
  });
  const Tag = useComputed$(() => {
    return props.block.tagName || 'div';
  });
  const canShowBlock = useComputed$(() => {
    if ('hide' in processedBlock.value) {
      return !processedBlock.value.hide;
    }
    if ('show' in processedBlock.value) {
      return processedBlock.value.show;
    }
    return true;
  });
  const childrenWithoutParentComponent = useComputed$(() => {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`.
     * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
     * blocks, and the children will be repeated within those blocks.
     */
    const shouldRenderChildrenOutsideRef =
      !blockComponent.value?.component && !repeatItem.value;
    return shouldRenderChildrenOutsideRef
      ? processedBlock.value.children ?? []
      : [];
  });
  const componentRefProps = useComputed$(() => {
    return {
      blockChildren: processedBlock.value.children ?? [],
      componentRef: blockComponent.value?.component,
      componentOptions: {
        ...getBlockComponentOptions(processedBlock.value),
        builderContext: props.context,
        ...(blockComponent.value?.name === 'Symbol' ||
        blockComponent.value?.name === 'Columns'
          ? {
              builderComponents: props.registeredComponents,
            }
          : {}),
      },
      context: state.childrenContext,
      registeredComponents: props.registeredComponents,
      builderBlock: processedBlock.value,
      includeBlockProps: blockComponent.value?.noWrap === true,
      isInteractive: !blockComponent.value?.isRSC,
    };
  });
  return (
    <>
      {canShowBlock.value ? (
        !blockComponent.value?.noWrap ? (
          <>
            {isEmptyHtmlElement(Tag.value) ? (
              <BlockWrapper
                Wrapper={Tag.value}
                block={processedBlock.value}
                context={props.context}
                hasChildren={false}
              ></BlockWrapper>
            ) : null}
            {!isEmptyHtmlElement(Tag.value) && repeatItem.value
              ? (repeatItem.value || []).map((data, index) => {
                  return (
                    <RepeatedBlock
                      key={index}
                      repeatContext={data.context}
                      block={data.block}
                      registeredComponents={props.registeredComponents}
                    ></RepeatedBlock>
                  );
                })
              : null}
            {!isEmptyHtmlElement(Tag.value) && !repeatItem.value ? (
              <BlockWrapper
                Wrapper={Tag.value}
                block={processedBlock.value}
                context={props.context}
                hasChildren={true}
              >
                <ComponentRef {...componentRefProps.value}></ComponentRef>
                {(childrenWithoutParentComponent.value || []).map((child) => {
                  return (
                    <Block
                      key={'block-' + child.id}
                      block={child}
                      context={state.childrenContext}
                      registeredComponents={props.registeredComponents}
                    ></Block>
                  );
                })}
                {(childrenWithoutParentComponent.value || []).map((child) => {
                  return (
                    <BlockStyles
                      key={'block-style-' + child.id}
                      block={child}
                      context={state.childrenContext}
                    ></BlockStyles>
                  );
                })}
              </BlockWrapper>
            ) : null}
          </>
        ) : (
          <ComponentRef {...componentRefProps.value}></ComponentRef>
        )
      ) : null}
    </>
  );
});

export default Block;
