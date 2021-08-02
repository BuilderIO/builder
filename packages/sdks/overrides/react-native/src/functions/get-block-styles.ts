import { sizes } from '../constants/device-sizes';
import { BuilderBlock } from '../types/builder-block';

export function getBlockStyles(block: BuilderBlock) {
  // TODO: bindings
  // TODO: responsive CSS using react native viewport width hooks
  const styles: any = {
    ...block.responsiveStyles?.large,
  };

  if (block.responsiveStyles?.medium) {
    Object.assign(styles, block.responsiveStyles.medium);
  }
  if (block.responsiveStyles?.small) {
    Object.assign(styles, block.responsiveStyles.small);
  }

  return styles;
}
