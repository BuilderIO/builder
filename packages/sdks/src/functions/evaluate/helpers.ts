import type {
  BuilderContextInterface,
  BuilderRenderState,
} from '../../context/types.js';
import { isBrowser } from '../is-browser.js';
import { isEditing } from '../is-editing.js';
import { getUserAttributes } from '../track/helpers.js';

export type EvaluatorArgs = Omit<ExecutorArgs, 'builder' | 'event'> & {
  event?: Event;
  isExpression?: boolean;
  enableCache: boolean;
};
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

export const getBuilderGlobals = (): BuilderGlobals => ({
  isEditing: isEditing(),
  isBrowser: isBrowser(),
  isServer: !isBrowser(),
  getUserAttributes: () => getUserAttributes(),
});

export const parseCode = (
  code: string,
  { isExpression = true }: Pick<EvaluatorArgs, 'isExpression'>
) => {
  // Be able to handle simple expressions like "state.foo" or "1 + 1"
  // as well as full blocks like "var foo = "bar"; return foo"
  const useReturn =
    // we disable this for cases where we definitely don't want a return
    isExpression &&
    !(
      code.includes(';') ||
      code.includes(' return ') ||
      code.trim().startsWith('return ')
    );
  const useCode = useReturn ? `return (${code});` : code;

  return useCode;
};
