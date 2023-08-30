import BlockStyles from '../block-styles.lite.jsx';
import Block from '../../block.lite.jsx';
import {
  For,
  Show,
  useMetadata,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import InteractiveElement from '../interactive-element.lite.jsx';
import type { ComponentProps } from './component-ref.helpers.js';
import { getWrapperProps } from './component-ref.helpers.js';
import { wrapComponentRef } from '../../../content/wrap-component-ref.js';

useMetadata({
  rsc: {
    componentType: 'server',
  },
});

/**
 * This is a wrapper around `InteractiveElement`. We need this wrapper so that custom component RSC's can be rendered
 * in the NextJS SDK.
 *
 * - If `isInteractive === false`, then we are dealing with an RSC custom component, so we render the `componentRef`
 *   directly without providing any interactive props (event handlers, etc.).
 * - If `isInteractive === true`, then we render the `InteractiveElement` client component, which will render the
 *  `componentRef` with interactive props.
 */
export default function ComponentRef(props: ComponentProps) {
  const state = useStore({
    Wrapper: props.isInteractive
      ? useTarget({
          vue2: wrapComponentRef(InteractiveElement),
          vue3: wrapComponentRef(InteractiveElement),
          default: InteractiveElement,
        })
      : props.componentRef,
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
