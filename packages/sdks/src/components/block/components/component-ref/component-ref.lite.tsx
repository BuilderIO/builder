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
    shouldUpdate: false,
    Wrapper: props.isInteractive
      ? useTarget({
          vue: wrapComponentRef(InteractiveElement),
          default: InteractiveElement,
        })
      : props.componentRef,
  });

  // onUpdate(() => {
  // useTarget({
  //   angular: () => {
  //     /**
  //      * The getter in <Block /> runs on every change detection, and returns us a new empty array in ngOnChanges
  //      * so we need to check if the values aren't two different empty arrays and if the values are actually different.
  //      * We only want to update the view if the values are different as it's an expensive operation.
  //      */
  //     if (
  //       // @ts-expect-error - 'changes' comes from Angular's ngOnChanges hook
  //       !changes['blockChildren']?.isFirstChange() &&
  //       // @ts-expect-error - 'changes' comes from Angular's ngOnChanges hook
  //       changes['blockChildren']?.previousValue?.length !== 0 &&
  //       // @ts-expect-error - 'changes' comes from Angular's ngOnChanges hook
  //       changes['blockChildren']?.currentValue?.length !== 0 &&
  //       // @ts-expect-error - 'changes' comes from Angular's ngOnChanges hook
  //       changes['blockChildren']?.previousValue !==
  //         // @ts-expect-error - 'changes' comes from Angular's ngOnChanges hook
  //         changes['blockChildren']?.currentValue
  //     ) {
  //       state.shouldUpdate = true;
  //     }
  //     // @ts-expect-error - 'changes' comes from Angular's ngOnChanges hook
  //     if (changes.componentOptions) {
  //       let foundChange = false;
  //       // @ts-expect-error - 'changes' comes from Angular's ngOnChanges hook
  //       for (const key in changes.componentOptions.previousValue) {
  //         if (
  //           // @ts-expect-error - 'changes' comes from Angular's ngOnChanges hook
  //           changes.componentOptions.previousValue[key] !==
  //           // @ts-expect-error - 'changes' comes from Angular's ngOnChanges hook
  //           changes.componentOptions.currentValue[key]
  //         ) {
  //           foundChange = true;
  //           break;
  //         }
  //       }
  //       if (!foundChange) {
  //         return;
  //       }
  //     }
  //   },
  //   default: () => {},
  // });
  // }, [props.componentOptions, props.blockChildren]);

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
