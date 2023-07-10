'use client';

import type { BuilderContextInterface } from '@/sdk-src/context/types';
import { getBlockActions } from '@/sdk-src/functions/get-block-actions';
import { getBlockProperties } from '@/sdk-src/functions/get-block-properties';
import type { BuilderBlock } from '@/sdk-src/types/builder-block';
import type { PropsWithChildren } from 'react';

export type RenderBlockProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: BuilderContextInterface;
  wrapperProps?: any;
};

function RenderBlockWrapper(props: PropsWithChildren<RenderBlockProps>) {
  function actions() {
    return getBlockActions({
      block: props.block,
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      localState: props.context.localState,
      context: props.context.context,
    });
  }

  function attributes() {
    return getBlockProperties({ block: props.block, context: props.context });
  }

  return (
    <props.Wrapper {...props.wrapperProps} {...attributes()} {...actions()}>
      {props.children}
    </props.Wrapper>
  );
}

export default RenderBlockWrapper;
