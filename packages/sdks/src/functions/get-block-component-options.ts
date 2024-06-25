import type { BuilderBlock } from '../types/builder-block.js';

export function getBlockComponentOptions(block: BuilderBlock) {
  return {
    ...block.component?.options,
    ...(block as any).options,
  };
}
