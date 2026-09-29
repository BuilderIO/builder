import type { ExecutorArgs } from '../helpers.js';
import { flattenState, getFunctionArguments } from '../helpers.js';

const MAX_CACHED_FUNCTIONS = 5000;
const FUNCTION_CACHE = new Map<string, (...args: any[]) => any>();

const getCompiledFunction = (argNames: string[], code: string) => {
  const key = argNames.join(',') + '\n' + code;
  let fn = FUNCTION_CACHE.get(key);
  if (!fn) {
    fn = new Function(...argNames, code) as (...args: any[]) => any;
    if (FUNCTION_CACHE.size >= MAX_CACHED_FUNCTIONS) {
      FUNCTION_CACHE.clear();
    }
    FUNCTION_CACHE.set(key, fn);
  }
  return fn;
};

export const runInBrowser = ({
  code,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState,
}: ExecutorArgs) => {
  const functionArgs = getFunctionArguments({
    builder,
    context,
    event,
    state: flattenState({ rootState, localState, rootSetState }),
  });

  return getCompiledFunction(
    functionArgs.map(([name]) => name),
    code
  )(...functionArgs.map(([, value]) => value));
};
