import type { BuilderRenderState } from '../../../context/types.js';
import type { ExecutorArgs } from '../helpers.js';
import { getFunctionArguments } from '../helpers.js';

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

  return new Function(...functionArgs.map(([name]) => name), code)(
    ...functionArgs.map(([, value]) => value)
  );
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
      if (typeof val === 'object') {
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
