import { createBoundedCache } from '../../../helpers/bounded-cache.js';
import type { ExecutorArgs } from '../helpers.js';
import { flattenState, getFunctionArguments } from '../helpers.js';

const MAX_CACHED_FUNCTIONS = 5000;
const FUNCTION_CACHE =
  createBoundedCache<(...args: any[]) => any>(MAX_CACHED_FUNCTIONS);

// `getFunctionArguments` always returns the same argument names, so `code` alone is the key.
const getCompiledFunction = (argNames: string[], code: string) => {
  let fn = FUNCTION_CACHE.get(code);
  if (!fn) {
    fn = new Function(...argNames, code) as (...args: any[]) => any;
    FUNCTION_CACHE.set(code, fn);
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
