import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from '../../../constants/device-sizes.js';
import { camelToKebabCase } from '../../../functions/camel-to-kebab-case.js';
import {
  createCssClass,
  getResponsiveStylesWithImagePosition,
} from '../../../helpers/css.js';
import { checkIsDefined } from '../../../helpers/nullable.js';
import type { BuilderBlock } from '../../../types/builder-block.js';
import type { BuilderContent } from '../../../types/builder-content.js';

/**
 * Only render styles for blocks that are visible.
 */
export const canShowBlockStyles = (block: BuilderBlock): boolean => {
  if (checkIsDefined(block.hide)) {
    return !block.hide;
  }
  if (checkIsDefined(block.show)) {
    return Boolean(block.show);
  }
  return true;
};

/**
 * The responsive (and hover animation) CSS of one block, scoped to its id class.
 */
export const getBlockStylesCss = (
  block: BuilderBlock,
  content: BuilderContent | null | undefined
): string => {
  const className = block.id;

  if (!className) {
    return '';
  }

  const styles = getResponsiveStylesWithImagePosition(
    block.responsiveStyles,
    block.component?.name === 'Image'
  );

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
    block.animations &&
    block.animations.find((item) => item.trigger === 'hover');

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
};
