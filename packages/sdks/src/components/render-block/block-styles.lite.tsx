import { TARGET } from '../../constants/target.js';
import BuilderContext from '../../context/builder.context.lite';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { BuilderBlock } from '../../types/builder-block.js';
import RenderInlinedStyles from '../render-inlined-styles.lite';
import { Show, useContext, useStore } from '@builder.io/mitosis';
import { convertStyleMaptoCSS } from '../../helpers/css.js';
import { getMaxWidthQueryForSize } from '../../constants/device-sizes.js';

export type BlockStylesProps = {
  block: BuilderBlock;
};

export default function BlockStyles(props: BlockStylesProps) {
  const builderContext = useContext(BuilderContext);

  const state = useStore({
    get useBlock(): BuilderBlock {
      return getProcessedBlock({
        block: props.block,
        state: builderContext.state,
        context: builderContext.context,
        evaluateBindings: true,
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
