import type { Signal } from '@builder.io/mitosis';
import {
  For,
  Show,
  onMount,
  useMetadata,
  useState,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types.js';
import { extractTextStyles } from '../../functions/extract-text-styles.js';
import { getBlockComponentOptions } from '../../functions/get-block-component-options.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { getStyle } from '../../functions/get-style.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import { bindAnimations } from './animator.js';
import { getComponent, getRepeatItemData } from './block.helpers.js';
import BlockStyles from './components/block-styles.lite.jsx';
import BlockWrapper from './components/block-wrapper.lite.jsx';
import type { ComponentProps } from './components/component-ref/component-ref.helpers.js';
import ComponentRef from './components/component-ref/component-ref.lite.jsx';
import RepeatedBlock from './components/repeated-block.lite.jsx';

export type BlockProps = {
  block: BuilderBlock;
  context: Signal<BuilderContextInterface>;
  registeredComponents: RegisteredComponents;
  linkComponent: any;
};

useMetadata({
  elementTag: 'state.Tag',
  options: {
    vue3: {
      asyncComponentImports: true,
    },
  },
  qwik: {
    setUseStoreFirst: true,
  },
  rsc: {
    componentType: 'server',
  },
});

export default function Block(props: BlockProps) {
  const state = useStore({
    get blockComponent() {
      return getComponent({
        block: props.block,
        context: props.context.value,
        registeredComponents: props.registeredComponents,
      });
    },
    get repeatItem() {
      return getRepeatItemData({
        block: props.block,
        context: props.context.value,
      });
    },
    get processedBlock(): BuilderBlock {
      return props.block.repeat?.collection
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
    get Tag() {
      const shouldUseLink =
        props.block.tagName === 'a' ||
        state.processedBlock.properties?.href ||
        state.processedBlock.href;

      if (shouldUseLink) {
        return (
          props.linkComponent ||
          useTarget({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            reactNative: BaseText,
            default: 'a',
          })
        );
      }

      return useTarget({
        /**
         * `tagName` will always be an HTML element. In the future, we might't map those to the right React Native components
         * For now, we just use `View` for all of them.
         * eslint-disable-next-line @typescript-eslint/ban-ts-comment
         * @ts-ignore */
        reactNative: View,
        default: props.block.tagName || 'div',
      });
    },
    get canShowBlock() {
      if (props.block.repeat?.collection) {
        if (state.repeatItem?.length) return true;
        return false;
      }

      const shouldHide =
        'hide' in state.processedBlock ? state.processedBlock.hide : false;
      const shouldShow =
        'show' in state.processedBlock ? state.processedBlock.show : true;

      return shouldShow && !shouldHide;
    },

    get childrenWithoutParentComponent() {
      /**
       * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
       * we render them outside of `componentRef`.
       * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
       * blocks, and the children will be repeated within those blocks.
       */
      const shouldRenderChildrenOutsideRef =
        !state.blockComponent?.component && !state.repeatItem;

      return shouldRenderChildrenOutsideRef
        ? state.processedBlock.children ?? []
        : [];
    },

    get componentRefProps(): ComponentProps {
      return {
        blockChildren: state.processedBlock.children ?? [],
        componentRef: state.blockComponent?.component,
        componentOptions: {
          ...getBlockComponentOptions(state.processedBlock),
          builderContext: props.context,
          ...(state.blockComponent?.name === 'Core:Button' ||
          state.blockComponent?.name === 'Symbol' ||
          state.blockComponent?.name === 'Columns' ||
          state.blockComponent?.name === 'Form:Form'
            ? { builderLinkComponent: props.linkComponent }
            : {}),
          ...(state.blockComponent?.name === 'Symbol' ||
          state.blockComponent?.name === 'Columns' ||
          state.blockComponent?.name === 'Form:Form'
            ? { builderComponents: props.registeredComponents }
            : {}),
        },
        context: childrenContext,
        linkComponent: props.linkComponent,
        registeredComponents: props.registeredComponents,
        builderBlock: state.processedBlock,
        includeBlockProps: state.blockComponent?.noWrap === true,
        isInteractive: !state.blockComponent?.isRSC,
      };
    },
  });

  const [childrenContext] = useState(
    useTarget({
      reactNative: {
        ...props.context.value,
        inheritedStyles: extractTextStyles(
          getStyle({
            block: state.processedBlock,
            context: props.context.value,
          }) || {}
        ),
      },
      default: props.context.value,
    }),
    { reactive: true }
  );

  onMount(() => {
    const blockId = state.processedBlock.id;
    const animations = state.processedBlock.animations;
    if (animations && blockId) {
      bindAnimations(
        animations
          .filter((item) => item.trigger !== 'hover')
          .map((animation) => ({
            ...animation,
            elementId: blockId,
          }))
      );
    }
  });

  return (
    <Show when={state.canShowBlock}>
      <BlockStyles block={props.block} context={props.context.value} />
      <Show
        when={!state.blockComponent?.noWrap}
        else={
          <ComponentRef
            componentRef={state.componentRefProps.componentRef}
            componentOptions={state.componentRefProps.componentOptions}
            blockChildren={state.componentRefProps.blockChildren}
            context={state.componentRefProps.context}
            registeredComponents={state.componentRefProps.registeredComponents}
            linkComponent={state.componentRefProps.linkComponent}
            builderBlock={state.componentRefProps.builderBlock}
            includeBlockProps={state.componentRefProps.includeBlockProps}
            isInteractive={state.componentRefProps.isInteractive}
          />
        }
      >
        <Show
          when={!state.repeatItem}
          else={
            <For each={state.repeatItem}>
              {(data, index) => (
                <RepeatedBlock
                  key={index}
                  repeatContext={data.context}
                  block={data.block}
                  registeredComponents={props.registeredComponents}
                  linkComponent={props.linkComponent}
                />
              )}
            </For>
          }
        >
          <BlockWrapper
            Wrapper={state.Tag}
            block={state.processedBlock}
            context={props.context}
            linkComponent={props.linkComponent}
          >
            <ComponentRef
              componentRef={state.componentRefProps.componentRef}
              componentOptions={state.componentRefProps.componentOptions}
              blockChildren={state.componentRefProps.blockChildren}
              context={state.componentRefProps.context}
              registeredComponents={
                state.componentRefProps.registeredComponents
              }
              linkComponent={state.componentRefProps.linkComponent}
              builderBlock={state.componentRefProps.builderBlock}
              includeBlockProps={state.componentRefProps.includeBlockProps}
              isInteractive={state.componentRefProps.isInteractive}
            />
            <For each={state.childrenWithoutParentComponent}>
              {(child) => (
                <Block
                  key={child.id}
                  block={child}
                  context={childrenContext}
                  registeredComponents={props.registeredComponents}
                  linkComponent={props.linkComponent}
                />
              )}
            </For>
          </BlockWrapper>
        </Show>
      </Show>
    </Show>
  );
}
