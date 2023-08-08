import type {
  BuilderContextInterface,
  BuilderRenderState,
} from '../../context/types.js';
import type { getUserAttributes } from '../track/helpers.js';

export type BuilderGlobals = {
  isEditing: boolean | undefined;
  isBrowser: boolean | undefined;
  isServer: boolean | undefined;
  getUserAttributes: typeof getUserAttributes;
};

export type ExecutorArgs = Pick<
  BuilderContextInterface,
  'localState' | 'context' | 'rootState' | 'rootSetState'
> & {
  code: string;
  builder: BuilderGlobals;
  event: Event | undefined;
};

export type Executor = (args: ExecutorArgs) => any;

export type FunctionArguments = ReturnType<typeof getFunctionArguments>;

export const getFunctionArguments = ({
  builder,
  context,
  event,
  state,
}: Pick<ExecutorArgs, 'builder' | 'context' | 'event'> & {
  state: BuilderRenderState;
}) => {
  return Object.entries({
    state,
    Builder: builder, // legacy
    builder,
    context,
    event,
  });
};
