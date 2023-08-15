import { Show, useStore } from '@builder.io/mitosis';
import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from '../../../constants/device-sizes.js';
import { TARGET } from '../../../constants/target.js';
import type { BuilderContextInterface } from '../../../context/types.js';
import { getProcessedBlock } from '../../../functions/get-processed-block.js';
import { createCssClass } from '../../../helpers/css.js';
import { checkIsDefined } from '../../../helpers/nullable.js';
import type { BuilderBlock } from '../../../types/builder-block.js';
import InlinedStyles from '../../inlined-styles.lite.jsx';
import { useMetadata } from '@builder.io/mitosis';

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
    processedBlock: getProcessedBlock({
      block: props.block,
      localState: props.context.localState,
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      context: props.context.context,
      shouldEvaluateBindings: true,
    }),

    get canShowBlock() {
      // only render styles for blocks that are visible
      if (checkIsDefined(state.processedBlock.hide)) {
        return !state.processedBlock.hide;
      }
      if (checkIsDefined(state.processedBlock.show)) {
        return state.processedBlock.show;
      }
      return true;
    },

    get css(): string {
      const styles = state.processedBlock.responsiveStyles;

      const content = props.context.content;
      const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
        content?.meta?.breakpoints || {}
      );

      const largeStyles = styles?.large;
      const mediumStyles = styles?.medium;
      const smallStyles = styles?.small;

      const className = state.processedBlock.id;

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
      <InlinedStyles styles={state.css} />
    </Show>
  );
}
