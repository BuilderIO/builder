import type { BuilderBlock } from '../types/builder-block';
export function getBlockComponentOptions(block: BuilderBlock) {
  return {
    ...block.component?.options,
    ...(block as any).options
  };
}