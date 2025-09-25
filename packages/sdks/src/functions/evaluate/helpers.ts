import type {
  BuilderContextInterface,
  BuilderRenderState,
} from '../../context/types.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { getTestCookie } from '../content-variants.js';
import { getCookie } from '../cookie.js';
import { getGlobalBuilderContext } from '../global-context.js';
import { isBrowser } from '../is-browser.js';
import { isEditing } from '../is-editing.js';
import type { EventProps } from '../track';
import { _track } from '../track';
import { getUserAttributes } from '../track/helpers.js';

export type EvaluatorArgs = Omit<ExecutorArgs, 'builder' | 'event'> & {
  event?: Event;
  isExpression?: boolean;
};
export type BuilderGlobals = {
  isEditing: boolean | undefined;
  isBrowser: boolean | undefined;
  isServer: boolean | undefined;
  getUserAttributes: typeof getUserAttributes;
  apiKey: string | undefined;
  contentId: string | undefined;
  getCookie: typeof getCookie;
  track: (
    eventName: string,
    properties: Partial<EventProps & { apiHost?: string }>,
    context?: any
  ) => void;
  trackConversion: (
    amount?: number,
    contentId?: string | any,
    variationId?: string,
    customProperties?: any,
    context?: any
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

export const getBuilderGlobals = (): BuilderGlobals => ({
  isEditing: isEditing(),
  isBrowser: isBrowser(),
  isServer: !isBrowser(),
  getUserAttributes: () => getUserAttributes(),
  apiKey: getGlobalBuilderContext().apiKey,
  contentId: getGlobalBuilderContext().contentId,
  getCookie: (args) => getCookie(args),
  track: (
    eventName: string,
    properties: Partial<EventProps & { apiHost?: string }> = {},
    context?: any
  ) => {
    const builderContext = getGlobalBuilderContext();
    _track({
      type: eventName,
      ...properties,
      apiHost: builderContext?.apiHost,
      apiKey: builderContext?.apiKey || '',
      context,
      canTrack: getDefaultCanTrack(properties.canTrack),
    });
  },
  trackConversion: (
    amount?: number,
    contentId?: string,
    variationId?: string,
    customProperties?: any,
    context?: any
  ) => {
    const meta = typeof contentId === 'object' ? contentId : customProperties;
    let useContentId = typeof contentId === 'string' ? contentId : undefined;
    const builderContext = getGlobalBuilderContext();

    if (!useContentId && builderContext?.contentId) {
      useContentId = builderContext.contentId;
    }

    let useVariationId = variationId;
    if (!useVariationId && useContentId) {
      useVariationId = getTestCookie(useContentId) || undefined;
    }

    _track({
      type: 'conversion',
      apiHost: builderContext?.apiHost,
      apiKey: builderContext?.apiKey || '',
      amount: amount || undefined,
      contentId: useContentId,
      variationId:
        useVariationId && useContentId && useVariationId !== useContentId
          ? useVariationId
          : undefined,
      meta,
      context: context || undefined,
      canTrack: getDefaultCanTrack(),
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
