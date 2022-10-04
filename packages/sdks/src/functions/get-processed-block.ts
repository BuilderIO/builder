import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate.js';
import { fastClone } from './fast-clone.js';
import { set } from './set.js';
import { transformBlock } from './transform-block.js';

const evaluateBindings = ({
  block,
  context,
  state,
}: {
  block: BuilderBlock;
} & Pick<BuilderContextInterface, 'state' | 'context'>): BuilderBlock => {
  if (!block.bindings) {
    return block;
  }
  const copy = fastClone(block);
  const copied = {
    ...copy,
    properties: { ...copy.properties },
    actions: { ...copy.actions },
  };

  for (const binding in block.bindings) {
    const expression = block.bindings[binding];
    const value = evaluate({ code: expression, state, context });
    set(copied, binding, value);
  }

  return copied;
};

export function getProcessedBlock({
  block,
  context,
  shouldEvaluateBindings,
  state,
}: {
  block: BuilderBlock;
  /**
   * In some cases, we want to avoid evaluating bindings and only want framework-specific block transformation. It is
   * also sometimes too early to consider bindings, e.g. when we might be looking at a repeated block.
   */
  shouldEvaluateBindings: boolean;
} & Pick<BuilderContextInterface, 'state' | 'context'>): BuilderBlock {
  const transformedBlock = transformBlock(block);

  if (shouldEvaluateBindings) {
    return evaluateBindings({ block: transformedBlock, state, context });
  } else {
    return transformedBlock;
  }
}
