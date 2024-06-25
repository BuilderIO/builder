import { logger } from '../../helpers/logger.js';
import { chooseBrowserOrServerEval } from './choose-eval.js';
import type { EvaluatorArgs, ExecutorArgs } from './helpers.js';
import { getBuilderGlobals, parseCode } from './helpers.js';

type EvalValue = unknown;

class EvalCache {
  static cacheLimit = 20;
  static cache = new Map<string, { value: EvalValue } | undefined>();

  static getCacheKey(args: ExecutorArgs) {
    return JSON.stringify({
      ...args,
      // replace the event with a random number to break cache
      // thats because we can't serialize the event object due to circular refs in DOM node refs.
      event: args.event ? Math.random() : undefined,
    });
  }

  static getCachedValue(key: string) {
    const cachedVal = EvalCache.cache.get(key);

    return cachedVal;
  }

  static setCachedValue(key: string, value: EvalValue) {
    if (EvalCache.cache.size > 20) {
      EvalCache.cache.delete(EvalCache.cache.keys().next().value);
    }
    EvalCache.cache.set(key, { value });
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
  enableCache,
}: EvaluatorArgs): EvalValue {
  if (code === '') {
    return undefined;
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

  if (enableCache) {
    const cacheKey = EvalCache.getCacheKey(args);
    const cachedValue = EvalCache.getCachedValue(cacheKey);

    if (cachedValue) {
      return cachedValue.value;
    }
  }

  try {
    const newEval = chooseBrowserOrServerEval(args);

    if (enableCache) {
      const cacheKey = EvalCache.getCacheKey(args);
      EvalCache.setCachedValue(cacheKey, newEval);
    }
    return newEval;
  } catch (e: any) {
    logger.error('Failed code evaluation: ' + e.message, { code });
    return undefined;
  }
}
