import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../../context/types.js';
import { getBlockActions } from '../../functions/get-block-actions.js';
import { getBlockComponentOptions } from '../../functions/get-block-component-options.js';
import { getBlockProperties } from '../../functions/get-block-properties.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import BlockStyles from './components/block-styles.lite.jsx';
import {
  getComponent,
  getRepeatItemData,
  isEmptyHtmlElement,
} from './block.helpers.js';
import type { ComponentProps } from './components/component.lite.jsx';
import type { Signal } from '@builder.io/mitosis';
import {
  For,
  Show,
  useMetadata,
  useState,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import RepeatedBlock from './components/repeated-block.lite.jsx';
import { TARGET } from '../../constants/target.js';
import { extractTextStyles } from '../../functions/extract-text-styles.js';
import Component from './components/component.lite.jsx';
import { getReactNativeBlockStyles } from '../../functions/get-react-native-block-styles.js';
import type { Dictionary } from '../../types/typescript.js';

export type RenderBlockProps = {
  block: BuilderBlock;
  context: Signal<BuilderContextInterface>;
  components: Dictionary<RegisteredComponent>;
};

useMetadata({
  elementTag: 'state.Tag',
});

export default function Block(props: RenderBlockProps) {
  const state = useStore({
    component: getComponent({
      block: props.block,
      context: props.context.value,
    }),
    get repeatItem() {
      return getRepeatItemData({
        block: props.block,
        context: props.context.value,
      });
    },
    get processedBlock(): BuilderBlock {
      return state.repeatItem
        ? props.block
        : getProcessedBlock({
            block: props.block,
            localState: props.context.value.localState,
            rootState: props.context.value.rootState,
            rootSetState: props.context.value.rootSetState,
            context: props.context.value.context,
            shouldEvaluateBindings: true,
          });
    },
    Tag: props.block.tagName || 'div',
    get canShowBlock() {
      if ('hide' in state.processedBlock) {
        return !state.processedBlock.hide;
      }
      if ('show' in state.processedBlock) {
        return state.processedBlock.show;
      }
      return true;
    },
    get actions() {
      return getBlockActions({
        block: state.processedBlock,
        rootState: props.context.value.rootState,
        rootSetState: props.context.value.rootSetState,
        localState: props.context.value.localState,
        context: props.context.value.context,
      });
    },
    get attributes() {
      const blockProperties = getBlockProperties(state.processedBlock);
      return {
        ...blockProperties,
        ...(TARGET === 'reactNative'
          ? {
              style: getReactNativeBlockStyles({
                block: state.processedBlock,
                context: props.context.value,
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
        ? state.processedBlock.children ?? []
        : [];
    },

    get renderComponentProps(): ComponentProps {
      return {
        blockChildren: state.processedBlock.children ?? [],
        componentRef: state.component?.component,
        componentOptions: {
          ...getBlockComponentOptions(state.processedBlock),
          /**
           * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
           * they are provided to the component itself directly.
           */
          ...(!state.component?.noWrap
            ? {}
            : { attributes: { ...state.attributes, ...state.actions } }),
          builderContext: props.context,
          ...(state.component?.name === 'Symbol' ||
          state.component?.name === 'Columns'
            ? { builderComponents: props.components }
            : {}),
        },
        context: childrenContext,
        components: props.components,
      };
    },
  });

  const [childrenContext] = useState(
    useTarget({
      reactNative: {
        apiKey: props.context.value.apiKey,
        apiVersion: props.context.value.apiVersion,
        localState: props.context.value.localState,
        rootState: props.context.value.rootState,
        rootSetState: props.context.value.rootSetState,
        content: props.context.value.content,
        context: props.context.value.context,
        registeredComponents: props.context.value.registeredComponents,
        inheritedStyles: extractTextStyles(
          getReactNativeBlockStyles({
            block: state.processedBlock,
            context: props.context.value,
            blockStyles: state.attributes.style,
          })
        ),
      },
      default: props.context.value,
    }),
    { reactive: true }
  );

  return (
    <Show when={state.canShowBlock}>
      <Show
        when={!state.component?.noWrap}
        else={<Component {...state.renderComponentProps} />}
      >
        {/*
         * Svelte is super finicky, and does not allow an empty HTML element (e.g. `img`) to have logic inside of it,
         * _even_ if that logic ends up not rendering anything.
         */}
        <Show when={isEmptyHtmlElement(state.Tag)}>
          <state.Tag {...state.attributes} {...state.actions} />
        </Show>
        <Show when={!isEmptyHtmlElement(state.Tag) && state.repeatItem}>
          <For each={state.repeatItem}>
            {(data, index) => (
              <RepeatedBlock
                key={index}
                repeatContext={data.context}
                block={data.block}
                components={props.components}
              />
            )}
          </For>
        </Show>
        <Show when={!isEmptyHtmlElement(state.Tag) && !state.repeatItem}>
          <state.Tag {...state.attributes} {...state.actions}>
            <Component {...state.renderComponentProps} />
            {/**
             * We need to run two separate loops for content + styles to workaround the fact that Vue 2
             * does not support multiple root elements.
             */}
            <For each={state.childrenWithoutParentComponent}>
              {(child) => (
                <Block
                  key={'render-block-' + child.id}
                  block={child}
                  context={childrenContext}
                  components={props.components}
                />
              )}
            </For>
            <For each={state.childrenWithoutParentComponent}>
              {(child) => (
                <BlockStyles
                  key={'block-style-' + child.id}
                  block={child}
                  context={childrenContext.value}
                />
              )}
            </For>
          </state.Tag>
        </Show>
      </Show>
    </Show>
  );
}
