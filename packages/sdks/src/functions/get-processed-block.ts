import type {
  BuilderRenderContext,
  BuilderRenderState,
} from '../context/builder.context.lite';
import { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate.js';
import { set } from './set.js';
import { transformBlock } from './transform-block.js';

const evaluateBindings = ({
  block,
  context,
  state,
}: {
  block: BuilderBlock;
  state: BuilderRenderState;
  context: BuilderRenderContext;
}): BuilderBlock => {
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
    const value = evaluate({ code: expression, state, context });
    set(copied, binding, value);
  }

  return copied;
};

export function getProcessedBlock(options: {
  block: BuilderBlock;
  state: BuilderRenderState;
  context: BuilderRenderContext;
  /**
   * In some cases, we want to avoid evaluating bindings and only want framework-specific block transformation. It is
   * also sometimes too early to consider bindings, e.g. when we might be looking at a repeated block.
   */
  evaluateBindings: boolean;
}): BuilderBlock {
  const { state, context } = options;
  const block = transformBlock(options.block);

  if (evaluateBindings) {
    return evaluateBindings({ block, state, context });
  } else {
    return block;
  }
}
