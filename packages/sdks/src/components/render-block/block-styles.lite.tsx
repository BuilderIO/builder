import { Show, useStore } from '@builder.io/mitosis';
import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from '../../constants/device-sizes.js';
import { TARGET } from '../../constants/target.js';
import type { BuilderContextInterface } from '../../context/types.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { createCssClass } from '../../helpers/css.js';
import { checkIsDefined } from '../../helpers/nullable.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import RenderInlinedStyles from '../render-inlined-styles.lite';

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

export default function BlockStyles(props: BlockStylesProps) {
  const state = useStore({
    get useBlock(): BuilderBlock {
      return getProcessedBlock({
        block: props.block,
        localState: props.context.localState,
        rootState: props.context.rootState,
        rootSetState: props.context.rootSetState,
        context: props.context.context,
        shouldEvaluateBindings: true,
      });
    },

    get canShowBlock() {
      // only render styles for blocks that are visible
      if (checkIsDefined(state.useBlock.hide)) {
        return !state.useBlock.hide;
      }
      if (checkIsDefined(state.useBlock.show)) {
        return state.useBlock.show;
      }
      return true;
    },

    get css(): string {
      const styles = state.useBlock.responsiveStyles;

      const content = props.context.content;
      const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
        content?.meta?.breakpoints || {}
      );

      const largeStyles = styles?.large;
      const mediumStyles = styles?.medium;
      const smallStyles = styles?.small;

      const className = state.useBlock.id;

      if (!className) {
        return '';
      }

      const largeStylesClass = largeStyles
        ? createCssClass({ className, styles: largeStyles })
        : '';

      const mediumStylesClass = mediumStyles
        ? createCssClass({
            className,
            styles: mediumStyles,
            mediaQuery: getMaxWidthQueryForSize(
              'medium',
              sizesWithUpdatedBreakpoints
            ),
          })
        : '';

      const smallStylesClass = smallStyles
        ? createCssClass({
            className,
            styles: smallStyles,
            mediaQuery: getMaxWidthQueryForSize(
              'small',
              sizesWithUpdatedBreakpoints
            ),
          })
        : '';

      return [largeStylesClass, mediumStylesClass, smallStylesClass].join(' ');
    },
  });
  return (
    <Show when={TARGET !== 'reactNative' && state.css && state.canShowBlock}>
      <RenderInlinedStyles styles={state.css} />
    </Show>
  );
}
