import type { Signal } from '@builder.io/mitosis';
import { Show, useMetadata } from '@builder.io/mitosis';
import type { BuilderContextInterface } from '../../../context/types.js';
import { getBlockActions } from '../../../functions/get-block-actions.js';
import { getBlockProperties } from '../../../functions/get-block-properties.js';
import type { BuilderBlock } from '../../../types/builder-block.js';
import type { PropsWithChildren } from '../../../types/typescript.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */

import { setAttrs } from '../../../blocks/helpers.js';

useMetadata({
  elementTag: 'props.Wrapper',
  options: {
    vue3: {
      asyncComponentImports: true,
    },
  },
  rsc: {
    componentType: 'client',
  },
});

type BlockWrapperProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: Signal<BuilderContextInterface>;
  hasChildren: boolean;
};

/**
 * This component renders a block's wrapper HTML element (from the block's `tagName` property).
 * It reuses the exact same logic as the `InteractiveElement` component, but we need to have 2 separate components for
 * Svelte's sake, as it needs to know at compile-time whether to use:
 *  - `<svelte:element>` (for HTML element) or
 *  - `<svelte:component>` (for custom components)
 */
export default function BlockWrapper(
  props: PropsWithChildren<BlockWrapperProps>
) {
  return (
    <Show
      when={props.hasChildren}
      else={
        <props.Wrapper
          {...getBlockProperties({
            block: props.block,
            context: props.context.value,
          })}
          /**
           * WARNING: this spread gets manipulated in `mitosis.config.js` for the Vue SDK, and must remain separate
           * from the other spread.
           */
          {...getBlockActions({
            block: props.block,
            rootState: props.context.value.rootState,
            rootSetState: props.context.value.rootSetState,
            localState: props.context.value.localState,
            context: props.context.value.context,
            stripPrefix: true,
          })}
        />
      }
    >
      <props.Wrapper
        {...getBlockProperties({
          block: props.block,
          context: props.context.value,
        })}
        /**
         * WARNING: this spread gets manipulated in `mitosis.config.js` for the Vue SDK, and must remain separate
         * from the other spread.
         */
        {...getBlockActions({
          block: props.block,
          rootState: props.context.value.rootState,
          rootSetState: props.context.value.rootSetState,
          localState: props.context.value.localState,
          context: props.context.value.context,
          stripPrefix: true,
        })}
      >
        {props.children}
      </props.Wrapper>
    </Show>
  );
}
