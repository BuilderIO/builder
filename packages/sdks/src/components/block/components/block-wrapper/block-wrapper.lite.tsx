import { useMetadata } from '@builder.io/mitosis';
import type { PropsWithChildren } from '../../../../types/typescript.js';
import type { InteractiveElementProps } from '../interactive-element/interactive-element.helpers.js';
import { getBlockProps } from '../interactive-element/interactive-element.helpers.js';

useMetadata({
  elementTag: 'props.Wrapper',
});

/**
 * This component renders a block's wrapper HTML element (from the block's `tagName` property).
 * It reuses the exact same logic as the `InteractiveElement` component, but we need to have 2 separate components for
 * Svelte's sake, as it needs to know at compile-time whether to use:
 *  - `<svelte:element>` (for HTML element) or
 *  - `<svelte:component>` (for custom components)
 */
export default function BlockWrapper(
  props: PropsWithChildren<InteractiveElementProps>
) {
  return (
    <props.Wrapper
      {...props.wrapperProps}
      {...getBlockProps({
        block: props.block,
        contextValue: props.context.value,
        shouldNestAttributes: props.shouldNestAttributes,
      })}
    >
      {props.children}
    </props.Wrapper>
  );
}
