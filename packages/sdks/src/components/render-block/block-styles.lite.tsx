import { Show, useMetadata, useStore } from '@builder.io/mitosis';
import { getMaxWidthQueryForSize } from '../../constants/device-sizes.js';
import { TARGET } from '../../constants/target.js';
import type { BuilderContextInterface } from '../../context/types.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { createCssClass } from '../../helpers/css.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import RenderInlinedStyles from '../render-inlined-styles.lite';

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

      const className = state.useBlock.id!;

      const largeStylesClass = largeStyles
        ? createCssClass({ className, styles: largeStyles })
        : '';

      const mediumStylesClass = mediumStyles
        ? createCssClass({
            className,
            styles: mediumStyles,
            mediaQuery: getMaxWidthQueryForSize('medium'),
          })
        : '';

      const smallStylesClass = smallStyles
        ? createCssClass({
            className,
            styles: smallStyles,
            mediaQuery: getMaxWidthQueryForSize('small'),
          })
        : '';

      return [largeStylesClass, mediumStylesClass, smallStylesClass].join(' ');
    },
  });
  return (
    <Show when={TARGET !== 'reactNative' && state.css}>
      <RenderInlinedStyles styles={state.css} />
    </Show>
  );
}
