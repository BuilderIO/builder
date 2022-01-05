import { BuilderBlock } from '../types/builder-block';

export function getBlockTag(block: BuilderBlock) {
  return block.tagName || 'div';
}
