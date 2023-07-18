import type { BuilderContextInterface } from '../../../context/types.js';
import { getBlockActions } from '../../../functions/get-block-actions.js';
import { getBlockProperties } from '../../../functions/get-block-properties.js';
import type { BuilderBlock } from '../../../types/builder-block.js';

import type { Signal } from '@builder.io/mitosis';
import { useMetadata, useStore } from '@builder.io/mitosis';
import type { PropsWithChildren } from '../../../types/typescript.js';

export type InteractiveElementProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: Signal<BuilderContextInterface>;
  wrapperProps?: any;
  shouldNestAttributes?: boolean;
};

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
  const state = useStore({
    get getBlockProps() {
      const blockProps = {
        ...getBlockProperties({
          block: props.block,
          context: props.context.value,
        }),
        ...getBlockActions({
          block: props.block,
          rootState: props.context.value.rootState,
          rootSetState: props.context.value.rootSetState,
          localState: props.context.value.localState,
          context: props.context.value.context,
        }),
      };

      if (props.shouldNestAttributes) {
        return { attributes: blockProps };
      }

      return blockProps;
    },
  });

  return (
    <props.Wrapper {...props.wrapperProps} {...state.getBlockProps}>
      {props.children}
    </props.Wrapper>
  );
}
