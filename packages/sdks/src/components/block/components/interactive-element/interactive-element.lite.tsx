import type { PropsWithChildren } from '../../../../types/typescript.js';
import type { InteractiveElementProps } from './interactive-element.helpers.js';
import { getBlockProps } from './interactive-element.helpers.js';

/**
 * This component renders the block component itself (from the list of registered components).
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
