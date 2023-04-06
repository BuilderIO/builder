import type { BuilderContextInterface } from '../context/types.js';
import { isBrowser } from './is-browser.js';
import { isEditing } from './is-editing.js';

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
    )(builder, builder, state, context, event);
  } catch (e) {
    console.warn(
      'Builder custom code error: \n While Evaluating: \n ',
      useCode,
      '\n',
      e
    );
  }
}
