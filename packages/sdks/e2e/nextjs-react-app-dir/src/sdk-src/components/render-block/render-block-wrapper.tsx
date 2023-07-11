'use client';

import type { BuilderContextInterface } from '@/sdk-src/context/types';
import { getBlockActions } from '@/sdk-src/functions/get-block-actions';
import { getBlockProperties } from '@/sdk-src/functions/get-block-properties';
import type { BuilderBlock } from '@/sdk-src/types/builder-block';
import type { PropsWithChildren } from 'react';

export type RenderBlockWrapperProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: BuilderContextInterface;
  wrapperProps?: any;
  shouldNestAttributes?: boolean;
};

function RenderBlockWrapper(props: PropsWithChildren<RenderBlockWrapperProps>) {
  function getBlockProps() {
    const blockProps = {
      ...getBlockProperties({ block: props.block, context: props.context }),
      ...getBlockActions({
        block: props.block,
        rootState: props.context.rootState,
        rootSetState: props.context.rootSetState,
        localState: props.context.localState,
        context: props.context.context,
      }),
    };

    if (props.shouldNestAttributes) {
      return { attributes: blockProps };
    }

    return blockProps;
  }

  return (
    <props.Wrapper {...props.wrapperProps} {...getBlockProps()}>
      {props.children}
    </props.Wrapper>
  );
}

export default RenderBlockWrapper;
