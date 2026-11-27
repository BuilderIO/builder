import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from '../../constants/device-sizes.js';
import type { BuilderContextInterface } from '../../context/types.js';
import { camelToKebabCase } from '../../functions/camel-to-kebab-case.js';
import {
  createCssClass,
  getResponsiveStylesWithImagePosition,
} from '../../helpers/css.js';
import { checkIsDefined } from '../../helpers/nullable.js';
import type { BuilderBlock } from '../../types/builder-block.js';

/** Whether a (processed) block renders its styles: hidden blocks don't. */
export const isBlockVisible = (block: BuilderBlock) => {
  if (checkIsDefined(block.hide)) return !block.hide;
  if (checkIsDefined(block.show)) return !!block.show;
  return true;
};

/**
 * A block's responsive and hover CSS (the `BlockStyles` component of the other SDKs, as a function:
 * no component, no reactive state per block).
 */
export function getBlockCss(
  block: BuilderBlock,
  content: BuilderContextInterface['content']
): string {
  const className = block.id;
  if (!className) return '';

  const styles = getResponsiveStylesWithImagePosition(
    block.responsiveStyles,
    block.component?.name === 'Image'
  );
  const sizes = getSizesForBreakpoints(content?.meta?.breakpoints || {});
  const hasXSmall = Boolean(content?.meta?.breakpoints?.xsmall);

  const large = styles?.large
    ? createCssClass({ className, styles: styles.large })
    : '';
  const medium = styles?.medium
    ? createCssClass({
        className,
        styles: styles.medium,
        mediaQuery: getMaxWidthQueryForSize('medium', sizes),
      })
    : '';
  const small = styles?.small
    ? createCssClass({
        className,
        styles: styles.small,
        mediaQuery: getMaxWidthQueryForSize('small', sizes),
      })
    : '';
  const xsmall =
    styles?.xsmall && hasXSmall
      ? createCssClass({
          className,
          styles: styles.xsmall,
          mediaQuery: getMaxWidthQueryForSize('xsmall', sizes),
        })
      : '';

  const hoverAnimation = block.animations?.find(
    (item) => item.trigger === 'hover'
  );
  let hover = '';
  if (hoverAnimation) {
    const hoverStyles = hoverAnimation.steps?.[1]?.styles || {};
    hover =
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

  return [large, medium, small, xsmall, hover].join(' ');
}
