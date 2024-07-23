import {
  For,
  Show,
  useMetadata,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import { wrapComponentRef } from '../../../content/wrap-component-ref.js';
import Block from '../../block.lite.jsx';
import InteractiveElement from '../interactive-element.lite.jsx';
import type { ComponentProps } from './component-ref.helpers.js';
import { getWrapperProps } from './component-ref.helpers.js';

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
          vue: wrapComponentRef(InteractiveElement),
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
          linkComponent: props.linkComponent,
          includeBlockProps: props.includeBlockProps,
          isInteractive: props.isInteractive,
          contextValue: props.context.value,
        })}
      >
        <For each={props.blockChildren}>
          {(child) => (
            <Block
              key={child.id}
              block={child}
              context={props.context}
              registeredComponents={props.registeredComponents}
              linkComponent={props.linkComponent}
            />
          )}
        </For>
      </state.Wrapper>
    </Show>
  );
}
