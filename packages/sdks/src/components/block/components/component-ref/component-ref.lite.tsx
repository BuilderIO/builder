import BlockStyles from '../block-styles.lite';
import Block from '../../block.lite';
import { For, Show, useMetadata, useStore } from '@builder.io/mitosis';
import InteractiveElement from '../interactive-element.lite';
import type { ComponentProps } from './component-ref.helpers.js';
import { getWrapperProps } from './component-ref.helpers.js';

useMetadata({
  rsc: {
    componentType: 'server',
  },
});

export default function ComponentRef(props: ComponentProps) {
  const state = useStore({
    Wrapper: props.isInteractive ? InteractiveElement : props.componentRef,
  });
  return (
    <Show when={props.componentRef}>
      <state.Wrapper
        {...getWrapperProps({
          componentOptions: props.componentOptions,
          builderBlock: props.builderBlock,
          context: props.context,
          componentRef: props.componentRef,
          includeBlockProps: props.includeBlockProps,
          isInteractive: props.isInteractive,
          contextValue: props.context.value,
        })}
      >
        {/**
         * We need to run two separate loops for content + styles to workaround the fact that Vue 2
         * does not support multiple root elements.
         */}
        <For each={props.blockChildren}>
          {(child) => (
            <Block
              key={'block-' + child.id}
              block={child}
              context={props.context}
              registeredComponents={props.registeredComponents}
            />
          )}
        </For>
        <For each={props.blockChildren}>
          {(child) => (
            <BlockStyles
              key={'block-style-' + child.id}
              block={child}
              context={props.context.value}
            />
          )}
        </For>
      </state.Wrapper>
    </Show>
  );
}
