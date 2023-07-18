import { useMetadata } from '@builder.io/mitosis';
import type { PropsWithChildren } from '../../../../types/typescript.js';
import type { InteractiveElementProps } from './interactive-element.helpers.js';
import { getBlockProps } from './interactive-element.helpers.js';

useMetadata({
  elementTag: 'props.Wrapper',
});

/**
 * This component is used to render:
 *  - a block's wrapper HTML element (from the block's `tagName` property)
 *  - the block itself (from the list of registered components)
 */
export default function InteractiveElement(
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
