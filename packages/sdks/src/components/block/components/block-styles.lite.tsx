import { Show, useMetadata, useStore } from '@builder.io/mitosis';
import { TARGET } from '../../../constants/target.js';
import type { BuilderContextInterface } from '../../../context/types.js';
import type { BuilderBlock } from '../../../types/builder-block.js';
import InlinedStyles from '../../inlined-styles.lite.jsx';
import {
  canShowBlockStyles,
  getBlockStylesCss,
} from './block-styles.helpers.js';

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

useMetadata({
  qwik: {
    setUseStoreFirst: true,
  },
});

export default function BlockStyles(props: BlockStylesProps) {
  const state = useStore({
    get canShowBlock() {
      return canShowBlockStyles(props.block);
    },

    get css(): string {
      return getBlockStylesCss(props.block, props.context.content);
    },
  });
  return (
    <Show when={TARGET !== 'reactNative' && state.css && state.canShowBlock}>
      <InlinedStyles
        styles={state.css}
        id="builderio-block"
        nonce={props.context.nonce}
      />
    </Show>
  );
}
