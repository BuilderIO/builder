import type { Signal } from '@builder.io/mitosis';
import type { BuilderContextInterface } from '../../../../context/types';
import { getBlockActions } from '../../../../functions/get-block-actions';
import { getBlockProperties } from '../../../../functions/get-block-properties';
import type { BuilderBlock } from '../../../../types/builder-block';

export type InteractiveElementProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: Signal<BuilderContextInterface>;
  wrapperProps?: any;
  shouldNestAttributes?: boolean;
};

export const getBlockProps = ({
  block,
  contextValue,
  shouldNestAttributes,
}: Pick<InteractiveElementProps, 'block' | 'shouldNestAttributes'> & {
  contextValue: BuilderContextInterface;
}) => {
  const blockProps = {
    ...getBlockProperties({
      block,
      context: contextValue,
    }),
    ...getBlockActions({
      block,
      rootState: contextValue.rootState,
      rootSetState: contextValue.rootSetState,
      localState: contextValue.localState,
      context: contextValue.context,
    }),
  };

  if (shouldNestAttributes) {
    return { attributes: blockProps };
  }

  return blockProps;
};
