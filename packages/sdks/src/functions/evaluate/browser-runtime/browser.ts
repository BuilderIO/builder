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
    state: flattenState(rootState, localState, rootSetState),
  });

  return new Function(...functionArgs.map(([name]) => name), code)(
    ...functionArgs.map(([, value]) => value)
  );
};

export function flattenState(
  rootState: Record<string | symbol, any>,
  localState: Record<string | symbol, any> | undefined,
  rootSetState: ((rootState: BuilderRenderState) => void) | undefined
): BuilderRenderState {
  if (rootState === localState) {
    throw new Error('rootState === localState');
  }

  return new Proxy(rootState, {
    get: (_, prop) => {
      if (localState && prop in localState) {
        return localState[prop];
      }
      return rootState[prop as string];
    },
    set: (_, prop, value) => {
      if (localState && prop in localState) {
        throw new Error(
          'Writing to local state is not allowed as it is read-only.'
        );
      }
      rootState[prop as string] = value;
      rootSetState?.(rootState);
      return true;
    },
  });
}
