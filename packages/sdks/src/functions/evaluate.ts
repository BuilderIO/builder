import type {
  BuilderRenderContext,
  BuilderRenderState,
} from '../context/builder.context.lite';
import { isBrowser } from './is-browser.js';
import { isEditing } from './is-editing.js';

export function evaluate({
  code,
  context,
  state,
  event,
}: {
  code: string;
  state: BuilderRenderState;
  context: BuilderRenderContext;
  event?: Event;
}): any {
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
  const useReturn = !(
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
    console.warn('Builder custom code error: ', e);
  }
}
