import type { Signal } from '@builder.io/mitosis';
import { useMetadata } from '@builder.io/mitosis';
import type { PropsWithChildren } from '../../../../types/typescript.js';
import { getBlockProps } from '../interactive-element/interactive-element.helpers.js';
import type { BuilderBlock } from '../../../../types/builder-block.js';
import type { BuilderContextInterface } from '../../../../context/types.js';

useMetadata({
  elementTag: 'props.Wrapper',
});

type BlockWrapperProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: Signal<BuilderContextInterface>;
};

/**
 * This component renders a block's wrapper HTML element (from the block's `tagName` property).
 * It reuses the exact same logic as the `InteractiveElement` component, but we need to have 2 separate components for
 * Svelte's sake, as it needs to know at compile-time whether to use:
 *  - `<svelte:element>` (for HTML element) or
 *  - `<svelte:component>` (for custom components)
 */
export default function BlockWrapper(
  props: PropsWithChildren<BlockWrapperProps>
) {
  return (
    <props.Wrapper
      {...getBlockProps({
        block: props.block,
        contextValue: props.context.value,
      })}
    >
      {props.children}
    </props.Wrapper>
  );
}
