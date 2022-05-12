import { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate.js';
import { set } from './set.js';
import { transformBlock } from './transform-block.js';

export function getProcessedBlock(options: {
  block: BuilderBlock;
  state: any;
  context: any;
}): BuilderBlock {
  const { state, context } = options;
  const block = transformBlock(options.block);

  if (!block.bindings) {
    return block;
  }
  const copied = {
    ...block,
    properties: { ...block.properties },
    actions: { ...block.actions },
  };

  for (const binding in block.bindings) {
    const expression = block.bindings[binding];
    const value = evaluate({
      code: expression,
      state,
      context,
    });
    set(copied, binding, value);
  }

  return copied;
}
