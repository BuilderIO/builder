import type { BuilderBlock } from '../types/builder-block.js';

export function getBlockComponentOptions(block: BuilderBlock) {
  return {
    ...block.component?.options,
    ...(block as any).options,
    /**
     * Our built-in components frequently make use of the block, so we provide all of it under `builderBlock`
     */
    builderBlock: block,
  };
}
