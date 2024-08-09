import type { BuilderContextInterface } from '../context/types.js';
import { omit } from '../helpers/omit.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate/index.js';
import { set } from './set.js';
import { transformBlock } from './transform-block.js';

// Deep clone a block but without cloning any child blocks
export function deepCloneWithConditions<T = any>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: any) => deepCloneWithConditions(item)) as T;
  }

  if ((obj as any)['@type'] === '@builder.io/sdk:Element') {
    return obj;
  }

  const clonedObj: any = {};

  for (const key in obj) {
    if (key !== 'meta' && Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepCloneWithConditions(obj[key]);
    }
  }

  return clonedObj;
}

const evaluateBindings = ({
  block,
  context,
  localState,
  rootState,
  rootSetState,
}: {
  block: BuilderBlock;
} & Pick<
  BuilderContextInterface,
  'localState' | 'context' | 'rootState' | 'rootSetState'
>): BuilderBlock => {
  if (!block.bindings) {
    return block;
  }
  // TODO: don't fast clone this! Any
  const copy = deepCloneWithConditions(omit(block, 'children', 'meta'));
  const copied = {
    ...copy,
    properties: { ...copy.properties },
    actions: { ...copy.actions },
    children: block.children,
    meta: block.meta,
  };

  for (const binding in block.bindings) {
    const expression = block.bindings[binding];
    const value = evaluate({
      code: expression,
      localState,
      rootState,
      rootSetState,
      context,
      enableCache: true,
    });
    set(copied, binding, value);
  }

  return copied as BuilderBlock;
};

export function getProcessedBlock({
  block,
  context,
  shouldEvaluateBindings,
  localState,
  rootState,
  rootSetState,
}: {
  block: BuilderBlock;
  /**
   * In some cases, we want to avoid evaluating bindings and only want framework-specific block transformation. It is
   * also sometimes too early to consider bindings, e.g. when we might be looking at a repeated block.
   */
  shouldEvaluateBindings: boolean;
} & Pick<
  BuilderContextInterface,
  'localState' | 'context' | 'rootState' | 'rootSetState'
>): BuilderBlock {
  const transformedBlock = transformBlock(block);

  if (shouldEvaluateBindings) {
    return evaluateBindings({
      block: transformedBlock,
      localState,
      rootState,
      rootSetState,
      context,
    });
  } else {
    return transformedBlock;
  }
}
