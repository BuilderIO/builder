import { logger } from '../../helpers/logger.js';
import { chooseBrowserOrServerEval } from './choose-eval.js';
import type { EvaluatorArgs, ExecutorArgs } from './helpers.js';
import { getBuilderGlobals, parseCode } from './helpers.js';

type CacheValue = NonNullable<unknown>;

class EvalCache {
  static cacheLimit = 20;
  static cache = new Map<string, CacheValue | undefined>();

  static getCacheKey(args: ExecutorArgs) {
    return JSON.stringify(args);
  }

  static getCachedValue(args: ExecutorArgs) {
    const cachedVal = EvalCache.cache.get(EvalCache.getCacheKey(args));

    return cachedVal;
  }

  static setCachedValue(args: ExecutorArgs, value: CacheValue) {
    if (EvalCache.cache.size > 20) {
      EvalCache.cache.delete(EvalCache.cache.keys().next().value);
    }
    EvalCache.cache.set(EvalCache.getCacheKey(args), value);
  }
}

export function evaluate({
  code,
  context,
  localState,
  rootState,
  rootSetState,
  event,
  isExpression = true,
}: EvaluatorArgs): any {
  if (code === '') {
    logger.warn('Skipping evaluation of empty code block.');
    return;
  }

  const args: ExecutorArgs = {
    code: parseCode(code, { isExpression }),
    builder: getBuilderGlobals(),
    context,
    event,
    rootSetState,
    rootState,
    localState,
  };

  const cachedValue = EvalCache.getCachedValue(args);
  if (cachedValue) {
    return cachedValue;
  }

  try {
    const newEval = chooseBrowserOrServerEval(args);
    EvalCache.setCachedValue(args, newEval);
    return newEval;
  } catch (e: any) {
    logger.error('Failed code evaluation: ' + e.message, { code });
    return undefined;
  }
}
