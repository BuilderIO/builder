import { logger } from '../../helpers/logger.js';
import { chooseBrowserOrServerEval } from './choose-eval.js';
import type { EvaluatorArgs, ExecutorArgs } from './helpers.js';
import { getBuilderGlobals, parseCode } from './helpers.js';

type CacheValue = NonNullable<unknown>;

class EvalCache {
  static cacheLimit = 20;
  static cache = new Map<string, CacheValue | undefined>();

  static getCachedValue(key: string) {
    const cachedVal = EvalCache.cache.get(key);

    return cachedVal;
  }

  static setCachedValue(key: string, value: CacheValue) {
    if (EvalCache.cache.size > 20) {
      EvalCache.cache.delete(EvalCache.cache.keys().next().value);
    }
    EvalCache.cache.set(key, value);
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

  const cachedValue = EvalCache.getCachedValue(code);
  if (cachedValue) {
    return cachedValue;
  }

  try {
    const newEval = chooseBrowserOrServerEval(args);
    EvalCache.setCachedValue(code, newEval);
    return newEval;
  } catch (e: any) {
    logger.error('Failed code evaluation: ' + e.message, { code });
    return undefined;
  }
}
