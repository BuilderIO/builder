import { sizes } from '../constants/device-sizes';
import { BuilderBlock } from '../types/builder-block';

export function getBlockStyles(block: BuilderBlock) {
  const styles: any = {
    ...block.responsiveStyles?.large,
    ...(block as any).styles,
  };

  if (block.responsiveStyles?.medium) {
    styles[`@media (max-width: ${sizes.medium})`] =
      block.responsiveStyles?.medium;
  }
  if (block.responsiveStyles?.small) {
    styles[`@media (max-width: ${sizes.small})`] =
      block.responsiveStyles?.small;
  }

  return styles;
}
