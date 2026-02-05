import type {
  BuilderContextInterface,
  BuilderRenderState,
} from '../../context/types.js';
import { isBrowser } from '../is-browser.js';
import { isEditing } from '../is-editing.js';
import { getUserAttributes } from '../track/helpers.js';
import { _track } from '../track/index.js';

export type TrackingContext = {
  apiKey: string | null;
  canTrack?: boolean;
  contentId?: string;
  variationId?: string;
};

export type EvaluatorArgs = Omit<ExecutorArgs, 'builder' | 'event'> & {
  event?: Event;
  isExpression?: boolean;
  trackingContext?: TrackingContext;
};
export type BuilderGlobals = {
  isEditing: boolean | undefined;
  isBrowser: boolean | undefined;
  isServer: boolean | undefined;
  getUserAttributes: typeof getUserAttributes;
  trackConversion: (
    amount?: number,
    customProperties?: Record<string, any>
  ) => void;
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

export const getBuilderGlobals = (
  trackingContext?: TrackingContext
): BuilderGlobals => ({
  isEditing: isEditing(),
  isBrowser: isBrowser(),
  isServer: !isBrowser(),
  getUserAttributes: () => getUserAttributes(),
  trackConversion: (
    amount?: number,
    customProperties?: Record<string, any>
  ) => {
    if (!trackingContext?.apiKey || trackingContext?.canTrack === false) {
      return;
    }
    _track({
      type: 'conversion',
      apiKey: trackingContext.apiKey,
      canTrack: trackingContext.canTrack ?? true,
      contentId: trackingContext.contentId,
      variationId:
        trackingContext.variationId !== trackingContext.contentId
          ? trackingContext.variationId
          : undefined,
      metadata: {
        amount,
        ...customProperties,
      },
    });
  },
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
