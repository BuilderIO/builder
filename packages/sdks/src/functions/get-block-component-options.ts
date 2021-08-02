import { BuilderBlock } from '../types/builder-block';

export function getBlockComponentOptions(block: BuilderBlock) {
  // TODO: bindings
  return block.component?.options;
}
