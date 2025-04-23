import { Show, useContext, useMetadata, useStore } from '@builder.io/mitosis';
import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from '../../../constants/device-sizes.js';
import { BuilderContext } from '../../../context/index.js';
import { getProcessedBlock } from '../../../functions/get-processed-block.js';
import { createCssClass } from '../../../helpers/css.js';
import { findBlockById } from '../../../helpers/find-block.js';
import { checkIsDefined } from '../../../helpers/nullable.js';
import { camelToKebabCase } from '../../../functions/camel-to-kebab-case.js';
import { TARGET } from '../../../constants/target.js';
import InlinedStyles from '../../inlined-styles.lite.jsx';
import type { BuilderBlock } from '../../../server-index.js';

type LiveEditBlockStylesProps = {
  id?: any;
};

useMetadata({
  rsc: {
    componentType: 'client',
  }
})

export default function LiveEditBlockStyles(props: LiveEditBlockStylesProps) {
  const contextProvider = useContext(BuilderContext);

  const state = useStore({
    get block() {
      return findBlockById(contextProvider.value.content!, props.id);
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
            localState: contextProvider.value.localState,
            rootState: contextProvider.value.rootState,
            rootSetState: contextProvider.value.rootSetState,
            context: contextProvider.value.context,
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

      const content = contextProvider.value.content;
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
        this.processedBlock.animations &&
        this.processedBlock.animations.find((item) => item.trigger === 'hover');

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
        nonce={contextProvider.value.nonce}
      />
    </Show>
  )
}
