import { getMaxWidthQueryForSize } from '../constants/device-sizes.js';
import { BuilderBlock } from '../types/builder-block.js';
import { convertStyleObject } from './convert-style-object.js';
import { sanitizeBlockStyles } from './sanitize-styles.js';

export function getBlockStyles(block: BuilderBlock) {
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
