import { Show, useMetadata, useStore } from '@builder.io/mitosis';
import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from '../../../constants/device-sizes.js';
import { TARGET } from '../../../constants/target.js';
import type { BuilderContextInterface } from '../../../context/types.js';
import { camelToKebabCase } from '../../../functions/camel-to-kebab-case.js';
import { createCssClass } from '../../../helpers/css.js';
import { checkIsDefined } from '../../../helpers/nullable.js';
import type { BuilderBlock } from '../../../types/builder-block.js';
import InlinedStyles from '../../inlined-styles.lite.jsx';

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
      const processedBlock = props.block;
      // only render styles for blocks that are visible
      if (checkIsDefined(processedBlock.hide)) {
        return !processedBlock.hide;
      }
      if (checkIsDefined(processedBlock.show)) {
        return processedBlock.show;
      }
      return true;
    },

    get css(): string {
      const processedBlock = props.block;

      const styles = processedBlock.responsiveStyles;

      const content = props.context.content;
      const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
        content?.meta?.breakpoints || {}
      );

      const contentHasXSmallBreakpoint = Boolean(
        content?.meta?.breakpoints?.xsmall
      );

      const largeStyles = styles?.large;
      const mediumStyles = styles?.medium;
      const smallStyles = styles?.small;
      const xsmallStyles = styles?.xsmall;
      const className = processedBlock.id;

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

      const xsmallStylesClass =
        xsmallStyles && contentHasXSmallBreakpoint
          ? createCssClass({
              className,
              styles: xsmallStyles,
              mediaQuery: getMaxWidthQueryForSize(
                'xsmall',
                sizesWithUpdatedBreakpoints
              ),
            })
          : '';

      const hoverAnimation =
        processedBlock.animations &&
        processedBlock.animations.find((item) => item.trigger === 'hover');

      let hoverStylesClass = '';
      if (hoverAnimation) {
        const hoverStyles = hoverAnimation.steps?.[1]?.styles || {};
        hoverStylesClass =
          createCssClass({
            className: `${className}:hover`,
            styles: {
              ...hoverStyles,
              transition: `all ${hoverAnimation.duration}s ${camelToKebabCase(
                hoverAnimation.easing
              )}`,
              transitionDelay: hoverAnimation.delay
                ? `${hoverAnimation.delay}s`
                : '0s',
            },
          }) || '';
      }

      return [
        largeStylesClass,
        mediumStylesClass,
        smallStylesClass,
        xsmallStylesClass,
        hoverStylesClass,
      ].join(' ');
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
