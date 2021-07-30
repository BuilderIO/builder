import { isBrowser } from './is-browser';
import { isEditing } from './is-editing';

export function evaluate(options: { code: string; state: any; context: any; event?: Event }): any {
  const { code } = options;
  const builder = {
    isEditing: isEditing(),
    isBrowser: isBrowser(),
  };

  // Be able to handle simple expressions like "state.foo" or "1 + 1"
  // as well as full blocks like "var foo = "bar"; return foo"
  const useReturn = !(
    code.includes(';') ||
    code.includes(' return ') ||
    code.trim().startsWith('return ')
  );

  const useCode = `${useReturn ? `return (${code});` : code}`;

  try {
    return new Function('builder', 'Builder' /* <- legacy */, 'state', 'context', 'event', useCode)(
      builder,
      builder,
      options.state,
      options.context,
      options.event
    );
  } catch (e) {
    console.warn('Builder custom code error', e);
  }
}
