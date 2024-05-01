import * as React from 'react';
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
import InlinedStyles from '../../inlined-styles';
import { camelCaseToKebabCase } from '../animator.js';

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

function BlockStyles(props: BlockStylesProps) {
  const canShowBlock = React.useMemo(() => {
    const processedBlock = getProcessedBlock({
      block: props.block,
      localState: props.context.localState,
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      context: props.context.context,
      shouldEvaluateBindings: true,
    });
    // only render styles for blocks that are visible
    if (checkIsDefined(processedBlock.hide)) {
      return !processedBlock.hide;
    }
    if (checkIsDefined(processedBlock.show)) {
      return processedBlock.show;
    }
    return true;
  }, [
    props.block,
    props.context.localState,
    props.context.rootState,
    props.context.rootSetState,
    props.context.context,
  ]);

  const css = React.useMemo(() => {
    const processedBlock = getProcessedBlock({
      block: props.block,
      localState: props.context.localState,
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      context: props.context.context,
      shouldEvaluateBindings: true,
    });
    const styles = processedBlock.responsiveStyles;
    const content = props.context.content;
    const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(content?.meta?.breakpoints || {});
    const largeStyles = styles?.large;
    const mediumStyles = styles?.medium;
    const smallStyles = styles?.small;
    const className = processedBlock.id;
    if (!className) {
      return '';
    }
    const largeStylesClass = largeStyles
      ? createCssClass({
          className,
          styles: largeStyles,
        })
      : '';
    const mediumStylesClass = mediumStyles
      ? createCssClass({
          className,
          styles: mediumStyles,
          mediaQuery: getMaxWidthQueryForSize('medium', sizesWithUpdatedBreakpoints),
        })
      : '';
    const smallStylesClass = smallStyles
      ? createCssClass({
          className,
          styles: smallStyles,
          mediaQuery: getMaxWidthQueryForSize('small', sizesWithUpdatedBreakpoints),
        })
      : '';
    const hoverAnimation =
      processedBlock.animations && processedBlock.animations.find(item => item.trigger === 'hover');
    let hoverStylesClass = '';
    if (hoverAnimation) {
      const hoverStyles = hoverAnimation.steps?.[1]?.styles || {};
      hoverStylesClass =
        createCssClass({
          className: `${className}:hover`,
          styles: {
            ...hoverStyles,
            transition: `all ${hoverAnimation.duration}s ${camelCaseToKebabCase(
              hoverAnimation.easing
            )}`,
            transitionDelay: hoverAnimation.delay ? `${hoverAnimation.delay}s` : '0s',
          },
        }) || '';
    }
    return [largeStylesClass, mediumStylesClass, smallStylesClass, hoverStylesClass].join(' ');
  }, [
    props.block,
    props.context.localState,
    props.context.rootState,
    props.context.rootSetState,
    props.context.context,
  ]);

  return (
    <>
      {TARGET !== 'reactNative' && css && canShowBlock ? (
        <>
          <InlinedStyles id="builderio-block" styles={css} />
        </>
      ) : null}
    </>
  );
}

export default BlockStyles;
