import type { BuilderBlock } from '../types/builder-block.js';

// Noope way for targets to make modifications to the block object if/as needed
export function transformBlock(block: BuilderBlock): BuilderBlock {
  return block;
}
