import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate/index.js';
import { resolveLocalizedValues } from './extract-localized-values.js';
import { isEditing } from './is-editing.js';
import { isPreviewing } from './is-previewing.js';
import { setCopyOnWrite } from './set.js';
import { transformBlock } from './transform-block.js';

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
  // Only objects along a bound path are copied: the block (and content) passed in is never mutated.
  const copied = new WeakSet<object>();
  const copy: BuilderBlock = {
    ...block,
    properties: { ...block.properties },
    actions: { ...block.actions },
  };
  copied.add(copy.properties!);
  copied.add(copy.actions!);

  for (const binding in block.bindings) {
    const expression = block.bindings[binding];
    const value = evaluate({
      code: expression,
      localState,
      rootState,
      rootSetState,
      context,
    });
    setCopyOnWrite(copy, binding, value, copied);
  }
  return copy;
};

/**
 * A block without bindings processes to the same result for a given locale, so
 * it is computed once per block object instead of on every render.
 */
const PROCESSED_BLOCKS_WITHOUT_BINDINGS = new WeakMap<
  BuilderBlock,
  Map<string, BuilderBlock>
>();

const hasBindings = (block: BuilderBlock) => {
  if (!block.bindings) return false;
  for (const _ in block.bindings) return true;
  return false;
};

export function getProcessedBlock({
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
>): BuilderBlock {
  const locale = rootState.locale as string | undefined;
  const canUseCache =
    !hasBindings(block) &&
    typeof block === 'object' &&
    block !== null &&
    !isEditing() &&
    !isPreviewing();

  const cacheKey = locale ?? '';
  if (canUseCache) {
    const cached = PROCESSED_BLOCKS_WITHOUT_BINDINGS.get(block)?.get(cacheKey);
    if (cached) return cached;
  }

  let transformedBlock = transformBlock(block);
  transformedBlock = evaluateBindings({
    block: transformedBlock,
    localState,
    rootState,
    rootSetState,
    context,
  });
  transformedBlock = resolveLocalizedValues(transformedBlock, locale);

  if (canUseCache) {
    let byLocale = PROCESSED_BLOCKS_WITHOUT_BINDINGS.get(block);
    if (!byLocale) {
      byLocale = new Map();
      PROCESSED_BLOCKS_WITHOUT_BINDINGS.set(block, byLocale);
    }
    byLocale.set(cacheKey, transformedBlock);
  }
  return transformedBlock;
}
