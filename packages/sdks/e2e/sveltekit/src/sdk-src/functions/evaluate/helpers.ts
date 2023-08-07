import type { BuilderContextInterface, BuilderRenderState } from '../../context/types';
import type { getUserAttributes } from '../track/helpers';
export type ExecutorArgs = Pick<BuilderContextInterface, 'localState' | 'context' | 'rootState' | 'rootSetState'> & {
  useCode: string;
  builder: {
    isEditing: boolean | undefined;
    isBrowser: boolean | undefined;
    isServer: boolean | undefined;
    getUserAttributes: typeof getUserAttributes;
  };
  event: Event | undefined;
};
export type Executor = (args: ExecutorArgs) => any;
export function flattenState(rootState: Record<string | symbol, any>, localState: Record<string | symbol, any> | undefined, rootSetState: ((rootState: BuilderRenderState) => void) | undefined): BuilderRenderState {
  if (rootState === localState) {
    throw new Error('rootState === localState');
  }
  return new Proxy(rootState, {
    get: (_, prop) => {
      if (localState && prop in localState) {
        return localState[prop];
      }
      return rootState[(prop as string)];
    },
    set: (_, prop, value) => {
      if (localState && prop in localState) {
        throw new Error('Writing to local state is not allowed as it is read-only.');
      }
      rootState[(prop as string)] = value;
      rootSetState?.(rootState);
      return true;
    }
  });
}
export type FunctionArguments = ReturnType<typeof getFunctionArguments>;
export const getFunctionArguments = ({
  builder,
  context,
  event,
  state
}: Pick<ExecutorArgs, 'builder' | 'context' | 'event'> & {
  state: BuilderRenderState;
}) => {
  return Object.entries({
    state,
    // legacy
    Builder: builder,
    builder,
    context,
    event
  });
}