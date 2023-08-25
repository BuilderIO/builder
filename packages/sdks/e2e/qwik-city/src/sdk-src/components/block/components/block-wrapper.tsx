import type { BuilderContextInterface } from '../../../context/types';

import { getBlockActions } from '../../../functions/get-block-actions';

import { getBlockProperties } from '../../../functions/get-block-properties';

import type { BuilderBlock } from '../../../types/builder-block';

import type { PropsWithChildren } from '../../../types/typescript';

import { Slot, component$ } from '@builder.io/qwik';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
type BlockWrapperProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: BuilderContextInterface;
  hasChildren: boolean;
};

/**
 * This component renders a block's wrapper HTML element (from the block's `tagName` property).
 * It reuses the exact same logic as the `InteractiveElement` component, but we need to have 2 separate components for
 * Svelte's sake, as it needs to know at compile-time whether to use:
 *  - `<svelte:element>` (for HTML element) or
 *  - `<svelte:component>` (for custom components)
 */
export const BlockWrapper = component$(
  (props: PropsWithChildren<BlockWrapperProps>) => {
    return (
      <>
        {props.hasChildren ? (
          <props.Wrapper
            {...getBlockProperties({
              block: props.block,
              context: props.context,
            })}
            {...getBlockActions({
              block: props.block,
              rootState: props.context.rootState,
              rootSetState: props.context.rootSetState,
              localState: props.context.localState,
              context: props.context.context,
              stripPrefix: true,
            })}
          >
            <Slot></Slot>
          </props.Wrapper>
        ) : (
          <props.Wrapper
            {...getBlockProperties({
              block: props.block,
              context: props.context,
            })}
            {...getBlockActions({
              block: props.block,
              rootState: props.context.rootState,
              rootSetState: props.context.rootSetState,
              localState: props.context.localState,
              context: props.context.context,
              stripPrefix: true,
            })}
          ></props.Wrapper>
        )}
      </>
    );
  }
);

export default BlockWrapper;
