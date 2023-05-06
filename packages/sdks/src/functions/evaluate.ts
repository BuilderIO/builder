import type {
  BuilderContextInterface,
  BuilderRenderState,
} from '../context/types.js';
import { isBrowser } from './is-browser.js';
import { isEditing } from './is-editing.js';

/**
 * Special property which allows chaining of states.
 *
 * This is used when a child state (from a repeat block) creates locals which should not be in the actual state.
 *
 * It is used to allow the evaluate() function to access the state of the parent block during assignments.
 */
export const PROTO_STATE = '$$proto$state$$';

export function evaluate({
  code,
  context,
  state,
  event,
  isExpression = true,
}: {
  code: string;
  event?: Event;
  isExpression?: boolean;
} & Pick<BuilderContextInterface, 'state' | 'context'>): any {
  if (code === '') {
    console.warn('Skipping evaluation of empty code block.');
    return;
  }

  const builder = {
    isEditing: isEditing(),
    isBrowser: isBrowser(),
    isServer: !isBrowser(),
  };

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

  try {
    return new Function(
      'builder',
      'Builder' /* <- legacy */,
      'state',
      'context',
      'event',
      useCode
    )(builder, builder, flattenState(state), context, event);
  } catch (e) {
    console.warn(
      'Builder custom code error: \n While Evaluating: \n ',
      useCode,
      '\n',
      e
    );
  }
}

export function flattenState(state: BuilderRenderState) {
  return new Proxy(state as Record<string | symbol, any>, {
    get: (target, prop) => {
      if (prop === PROTO_STATE) {
        return undefined;
      }
      while (target) {
        if (prop in target) return target[prop];
        target = target[PROTO_STATE];
      }
      return undefined;
    },
    set: (target, prop, value) => {
      if (prop === PROTO_STATE) {
        return false;
      }
      let parentTarget = target;
      do {
        target = parentTarget;
        parentTarget = parentTarget[PROTO_STATE];
        if (!parentTarget || prop in target) {
          target[prop] = value;
          return true;
        }
      } while (parentTarget);
      target = target[PROTO_STATE];
      return true;
    },
    has: (target, prop) => {
      if (prop === PROTO_STATE) {
        return false;
      }
      return prop in target;
    },
  });
}
