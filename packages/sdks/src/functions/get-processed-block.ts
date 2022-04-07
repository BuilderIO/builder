import { BuilderBlock } from '../types/builder-block';
import { evaluate } from './evaluate';
import { set } from './set';
import { transformBlock } from './transform-block';

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
