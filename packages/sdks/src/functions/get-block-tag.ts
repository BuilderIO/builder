import type { BuilderBlock } from '../types/builder-block.js';

export type TagName = string;

export function getBlockTag(block: BuilderBlock): TagName {
  return block.tagName || 'div';
}
