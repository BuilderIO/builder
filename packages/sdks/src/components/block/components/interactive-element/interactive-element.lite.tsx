import type { PropsWithChildren } from '../../../../types/typescript.js';
import type { InteractiveElementProps } from './interactive-element.helpers.js';
import { getBlockProps } from './interactive-element.helpers.js';

/**
 * This component renders the block component itself (from the list of registered components).
 * We have to keep this logic in its own component so that it can become a client component in our RSC SDK.
 */
export default function InteractiveElement(
  props: PropsWithChildren<InteractiveElementProps>
) {
  return (
    <props.Wrapper
      {...props.wrapperProps}
      attributes={getBlockProps({
        block: props.block,
        contextValue: props.context.value,
      })}
    >
      {props.children}
    </props.Wrapper>
  );
}
