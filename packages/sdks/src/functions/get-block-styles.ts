import { getMaxWidthQueryForSize } from '../constants/device-sizes.js';
import { BuilderBlock } from '../types/builder-block.js';

export function getBlockStyles(block: BuilderBlock) {
  const styles = {
    ...block.responsiveStyles?.large,
    ...(block as any).styles,
  };

  if (block.responsiveStyles?.medium) {
    styles[getMaxWidthQueryForSize('medium')] = block.responsiveStyles?.medium;
  }
  if (block.responsiveStyles?.small) {
    styles[getMaxWidthQueryForSize('small')] = block.responsiveStyles?.small;
  }

  return styles;
}
