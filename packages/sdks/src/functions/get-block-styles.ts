import { getMaxWidthQueryForSize } from '../constants/device-sizes.js';
import { TARGET } from '../constants/target.js';
import { BuilderBlock } from '../types/builder-block.js';
import { convertStyleObject } from './convert-style-object.js';
import { sanitizeBlockStyles } from './sanitize-styles.js';

export function getBlockStyles(block: BuilderBlock) {
  if (TARGET === ('qwik' as any)) return null;
  const styles = {
    ...convertStyleObject(block.responsiveStyles?.large),
    /**
     * TO-DO: remove?
     */
    ...(block as any).styles,
  };

  if (block.responsiveStyles?.medium) {
    styles[getMaxWidthQueryForSize('medium')] = convertStyleObject(
      block.responsiveStyles?.medium
    );
  }
  if (block.responsiveStyles?.small) {
    styles[getMaxWidthQueryForSize('small')] = convertStyleObject(
      block.responsiveStyles?.small
    );
  }

  sanitizeBlockStyles(styles);

  return styles;
}
