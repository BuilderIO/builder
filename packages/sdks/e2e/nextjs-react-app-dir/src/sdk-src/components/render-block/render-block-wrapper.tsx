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

  function getWrapperProps() {
    const wProps =  { ...attributes(), ...actions() }

    if (props.shouldNestAttributes) {
      return { attributes: wProps }
    }

    return wProps
  }

  return (
    <props.Wrapper {...props.wrapperProps} {...getWrapperProps()}>
      {props.children}
    </props.Wrapper>
  );
}

export default RenderBlockWrapper;
