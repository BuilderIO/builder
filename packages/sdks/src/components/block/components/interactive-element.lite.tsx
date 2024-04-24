import { useMetadata, type Signal, useStore } from '@builder.io/mitosis';
import type { BuilderContextInterface } from '../../../context/types.js';
import { getBlockActions } from '../../../functions/get-block-actions.js';
import { getBlockProperties } from '../../../functions/get-block-properties.js';
import type { BuilderBlock } from '../../../types/builder-block.js';
import type { Dictionary } from '../../../types/typescript.js';

export type InteractiveElementProps = {
  Wrapper: any;
  block: BuilderBlock;
  context: Signal<BuilderContextInterface>;
  wrapperProps: Dictionary<any>;
  includeBlockProps: boolean;
  children?: any;
};

useMetadata({
  options: {
    vue: {
      asyncComponentImports: true,
    },
  },
  rsc: {
    componentType: 'client',
  },
});

/**
 * This component renders an interactive component (from the list of registered components).
 * We have to keep this logic in its own component so that it can become a client component in our RSC SDK.
 */
export default function InteractiveElement(props: InteractiveElementProps) {
  const state = useStore({
    get attributes() {
      return props.includeBlockProps
        ? {
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
          }
        : {};
    },
  });

  return (
    <props.Wrapper {...props.wrapperProps} attributes={state.attributes}>
      {props.children}
    </props.Wrapper>
  );
}
