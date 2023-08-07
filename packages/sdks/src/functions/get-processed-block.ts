import type { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate';
import type { EvaluatorArgs } from './evaluate/evaluate.js';
import { fastClone } from './fast-clone.js';
import { set } from './set.js';
import { transformBlock } from './transform-block.js';

type PassThroughProps = Pick<
  EvaluatorArgs,
  'localState' | 'context' | 'rootState' | 'rootSetState' | 'serverExecutor'
>;

const evaluateBindings = ({
  block,
  ...args
}: {
  block: BuilderBlock;
} & PassThroughProps): BuilderBlock => {
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
    const value = evaluate({
      code: expression,
      ...args,
    });
    set(copied, binding, value);
  }

  return copied;
};

export function getProcessedBlock({
  block,
  shouldEvaluateBindings,
  ...args
}: {
  block: BuilderBlock;
  /**
   * In some cases, we want to avoid evaluating bindings and only want framework-specific block transformation. It is
   * also sometimes too early to consider bindings, e.g. when we might be looking at a repeated block.
   */
  shouldEvaluateBindings: boolean;
} & PassThroughProps): BuilderBlock {
  const transformedBlock = transformBlock(block);

  if (shouldEvaluateBindings) {
    return evaluateBindings({
      block: transformedBlock,
      ...args,
    });
  } else {
    return transformedBlock;
  }
}
