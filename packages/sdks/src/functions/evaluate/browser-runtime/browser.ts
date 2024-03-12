import type { BuilderRenderState } from '../../../context/types.js';
import type { ExecutorArgs } from '../helpers.js';
import { getFunctionArguments } from '../helpers.js';

class FunctionCache {
  static cacheLimit = 20;
  static cache = new Map<string, (...args: any) => any>();

  static getCachedFunction(key: string, params: [string, any][], code: string): (...args: any) => any {
    const cachedFn = FunctionCache.cache.get(key);
    if (cachedFn) {
      return cachedFn;
    }
    const newFn = new Function(...params.map(([name]) => name), code);
    if (FunctionCache.cache.size > 20) {
      FunctionCache.cache.delete(FunctionCache.cache.keys().next().value);
    }
    FunctionCache.cache.set(key, newFn as any);
    return newFn as any;
  }
}

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

  return FunctionCache.getCachedFunction(JSON.stringify([...functionArgs, code]),
    functionArgs,
    code
  )(...functionArgs.map(([, value]) => value));
};

export function flattenState({
  rootState,
  localState,
  rootSetState,
}: {
  rootState: Record<string | symbol, any>;
  localState: Record<string | symbol, any> | undefined;
  rootSetState: ((rootState: BuilderRenderState) => void) | undefined;
}): BuilderRenderState {
  return new Proxy(rootState, {
    get: (target, prop) => {
      if (localState && prop in localState) {
        return localState[prop];
      }

      const val = target[prop];
      if (typeof val === 'object' && val !== null) {
        return flattenState({
          rootState: val,
          localState: undefined,
          rootSetState: rootSetState
            ? (subState) => {
                target[prop] = subState;
                rootSetState(target);
              }
            : undefined,
        });
      }

      return val;
    },
    set: (target, prop, value) => {
      if (localState && prop in localState) {
        throw new Error(
          'Writing to local state is not allowed as it is read-only.'
        );
      }

      target[prop] = value;

      rootSetState?.(target);
      return true;
    },
  });
}
