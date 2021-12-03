import { evaluate } from './evaluate';
import { set } from './set';

export function getProcessedBlock(options: {
  block: any;
  state: any;
  context: any;
}) {
  const { block, state, context } = options;
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
