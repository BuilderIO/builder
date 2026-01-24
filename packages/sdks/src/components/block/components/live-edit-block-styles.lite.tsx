import { Show, useMetadata, useStore } from '@builder.io/mitosis';
import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from '../../../constants/device-sizes.js';
import { TARGET } from '../../../constants/target.js';
import { camelToKebabCase } from '../../../functions/camel-to-kebab-case.js';
import { getProcessedBlock } from '../../../functions/get-processed-block.js';
import { createCssClass } from '../../../helpers/css.js';
import { findBlockById } from '../../../helpers/find-block.js';
import { checkIsDefined } from '../../../helpers/nullable.js';
import type {
  BuilderBlock,
  BuilderContextInterface,
} from '../../../server-index.js';
import InlinedStyles from '../../inlined-styles.lite.jsx';

type LiveEditBlockStylesProps = {
  id?: any;
  contextProvider: BuilderContextInterface;
};

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export default function LiveEditBlockStyles(props: LiveEditBlockStylesProps) {
  const state = useStore({
    get block() {
      return findBlockById(props.contextProvider.content!, props.id);
    },
    get processedBlock(): BuilderBlock | null {
      const foundBlock = this.block;
      if (!foundBlock) {
        return null;
      }
      const blockToUse = foundBlock.repeat?.collection
        ? foundBlock
        : getProcessedBlock({
            block: foundBlock,
            localState: props.contextProvider.localState,
            rootState: props.contextProvider.rootState,
            rootSetState: props.contextProvider.rootSetState,
            context: props.contextProvider.context,
          });

      return blockToUse;
    },
    get canShowBlock() {
      if (checkIsDefined(this.processedBlock?.hide)) {
        return !this.processedBlock?.hide;
      }
      if (checkIsDefined(this.processedBlock?.show)) {
        return this.processedBlock?.show;
      }
      return true;
    },

    get css(): string {
      const styles = this.processedBlock?.responsiveStyles;

      const content = props.contextProvider.content;
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
      const className = this.processedBlock?.id;

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
        this.processedBlock?.animations &&
        this.processedBlock?.animations?.find((item) => item.trigger === 'hover');

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
    <Show when={TARGET === 'rsc' && state.css && state.canShowBlock}>
      <InlinedStyles
        styles={state.css}
        id="builderio-block"
        nonce={props.contextProvider.nonce}
      />
    </Show>
  );
}
