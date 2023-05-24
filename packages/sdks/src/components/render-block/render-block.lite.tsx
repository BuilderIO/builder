import type { BuilderContextInterface } from '../../context/types.js';
import { getBlockActions } from '../../functions/get-block-actions.js';
import { getBlockComponentOptions } from '../../functions/get-block-component-options.js';
import { getBlockProperties } from '../../functions/get-block-properties.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import BlockStyles from './block-styles.lite';
import {
  getComponent,
  getRepeatItemData,
  isEmptyHtmlElement,
} from './render-block.helpers.js';
import type { RenderComponentProps } from './render-component.lite';
import { For, Show, useMetadata, useStore } from '@builder.io/mitosis';
import RenderRepeatedBlock from './render-repeated-block.lite';
import { TARGET } from '../../constants/target.js';
import { extractTextStyles } from '../../functions/extract-text-styles.js';
import RenderComponent from './render-component.lite';
import { getReactNativeBlockStyles } from '../../functions/get-react-native-block-styles.js';

export type RenderBlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

useMetadata({
  elementTag: 'state.tag',
});

export default function RenderBlock(props: RenderBlockProps) {
  const state = useStore({
    component: getComponent({ block: props.block, context: props.context }),
    get repeatItem() {
      return getRepeatItemData({
        block: props.block,
        context: props.context,
      });
    },
    get useBlock(): BuilderBlock {
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
    tag: props.block.tagName || 'div',
    get canShowBlock() {
      if ('hide' in state.useBlock) {
        return !state.useBlock.hide;
      }
      if ('show' in state.useBlock) {
        return state.useBlock.show;
      }
      return true;
    },
    get actions() {
      return getBlockActions({
        block: state.useBlock,
        rootState: props.context.rootState,
        rootSetState: props.context.rootSetState,
        localState: props.context.localState,
        context: props.context.context,
      });
    },
    get attributes() {
      const blockProperties = getBlockProperties(state.useBlock);
      return {
        ...blockProperties,
        ...(TARGET === 'reactNative'
          ? {
              style: getReactNativeBlockStyles({
                block: state.useBlock,
                context: props.context,
                blockStyles: blockProperties.style,
              }),
            }
          : {}),
      };
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
        ? state.useBlock.children ?? []
        : [];
    },

    get childrenContext(): BuilderContextInterface {
      const getInheritedTextStyles = () => {
        if (TARGET !== 'reactNative') {
          return {};
        }

        return extractTextStyles(
          getReactNativeBlockStyles({
            block: state.useBlock,
            context: props.context,
            blockStyles: state.attributes.style,
          })
        );
      };

      return {
        apiKey: props.context.apiKey,
        apiVersion: props.context.apiVersion,
        localState: props.context.localState,
        rootState: props.context.rootState,
        rootSetState: props.context.rootSetState,
        content: props.context.content,
        context: props.context.context,
        registeredComponents: props.context.registeredComponents,
        inheritedStyles: getInheritedTextStyles(),
      };
    },

    get renderComponentProps(): RenderComponentProps {
      return {
        blockChildren: state.useBlock.children ?? [],
        componentRef: state.component?.component,
        componentOptions: {
          ...getBlockComponentOptions(state.useBlock),
          /**
           * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
           * they are provided to the component itself directly.
           */
          ...(!state.component?.noWrap
            ? {}
            : { attributes: { ...state.attributes, ...state.actions } }),
        },
        context: state.childrenContext,
      };
    },
  });

  return (
    <Show when={state.canShowBlock}>
      <Show
        when={!state.component?.noWrap}
        else={<RenderComponent {...state.renderComponentProps} />}
      >
        {/*
         * Svelte is super finicky, and does not allow an empty HTML element (e.g. `img`) to have logic inside of it,
         * _even_ if that logic ends up not rendering anything.
         */}
        <Show when={isEmptyHtmlElement(state.tag)}>
          <state.tag {...state.attributes} {...state.actions} />
        </Show>
        <Show when={!isEmptyHtmlElement(state.tag) && state.repeatItem}>
          <For each={state.repeatItem}>
            {(data, index) => (
              <RenderRepeatedBlock
                key={index}
                repeatContext={data.context}
                block={data.block}
              />
            )}
          </For>
        </Show>
        <Show when={!isEmptyHtmlElement(state.tag) && !state.repeatItem}>
          <state.tag {...state.attributes} {...state.actions}>
            <RenderComponent {...state.renderComponentProps} />
            {/**
             * We need to run two separate loops for content + styles to workaround the fact that Vue 2
             * does not support multiple root elements.
             */}
            <For each={state.childrenWithoutParentComponent}>
              {(child) => (
                <RenderBlock
                  key={'render-block-' + child.id}
                  block={child}
                  context={state.childrenContext}
                />
              )}
            </For>
            <For each={state.childrenWithoutParentComponent}>
              {(child) => (
                <BlockStyles
                  key={'block-style-' + child.id}
                  block={child}
                  context={state.childrenContext}
                />
              )}
            </For>
          </state.tag>
        </Show>
      </Show>
    </Show>
  );
}
