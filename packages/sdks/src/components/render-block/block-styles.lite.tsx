import { Show, useMetadata, useStore } from '@builder.io/mitosis';
import { getMaxWidthQueryForSize } from '../../constants/device-sizes.js';
import { TARGET } from '../../constants/target.js';
import { BuilderContextInterface } from '../../context/types.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { convertStyleMaptoCSS } from '../../helpers/css.js';
import { BuilderBlock } from '../../types/builder-block.js';
import RenderInlinedStyles from '../render-inlined-styles.lite';

// eslint-disable-next-line @builder.io/mitosis/only-default-function-and-imports
useMetadata({
  qwik: {
    component: {
      isLight: true,
    },
  },
});

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

export default function BlockStyles(props: BlockStylesProps) {
  const state = useStore({
    get useBlock(): BuilderBlock {
      return getProcessedBlock({
        block: props.block,
        state: props.context.state,
        context: props.context.context,
        shouldEvaluateBindings: true,
      });
    },

    get css(): string {
      const styles = state.useBlock.responsiveStyles;

      const largeStyles = styles?.large;
      const mediumStyles = styles?.medium;
      const smallStyles = styles?.small;

      return `
        ${
          largeStyles
            ? `.${state.useBlock.id} {${convertStyleMaptoCSS(largeStyles)}}`
            : ''
        }
        ${
          mediumStyles
            ? `${getMaxWidthQueryForSize('medium')} {
              .${state.useBlock.id} {${convertStyleMaptoCSS(mediumStyles)}}
            }`
            : ''
        }
        ${
          smallStyles
            ? `${getMaxWidthQueryForSize('small')} {
              .${state.useBlock.id} {${convertStyleMaptoCSS(smallStyles)}}
            }`
            : ''
        }
      }`;
    },
  });
  return (
    <Show when={TARGET === 'vue2' || TARGET === 'vue3' || TARGET === 'svelte'}>
      <RenderInlinedStyles styles={state.css} />
    </Show>
  );
}
