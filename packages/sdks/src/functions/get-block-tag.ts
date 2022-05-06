import { BuilderBlock } from '../types/builder-block.js';

export function getBlockTag(block: BuilderBlock) {
  return block.tagName || 'div';
}
