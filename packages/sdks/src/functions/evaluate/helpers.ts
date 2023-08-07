import type {
  BuilderContextInterface,
  BuilderRenderState,
} from '../../context/types';
import type { getUserAttributes } from '../track/helpers';

export type ExecutorArgs = Pick<
  BuilderContextInterface,
  'localState' | 'context' | 'rootState' | 'rootSetState'
> & {
  code: string;
  builder: {
    isEditing: boolean | undefined;
    isBrowser: boolean | undefined;
    isServer: boolean | undefined;
    getUserAttributes: typeof getUserAttributes;
  };
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
    // legacy
    Builder: builder,
    builder,
    context,
    event,
  });
};
