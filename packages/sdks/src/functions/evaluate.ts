import { isBrowser } from './is-browser';
import { isEditing } from './is-editing';

export function evaluate(options: {
  code: string;
  state: any;
  context: any;
  event?: Event;
}): any {
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
    console.log('1');
    const fn = new Function(
      'builder',
      'Builder' /* <- legacy */,
      'state',
      'context',
      'event',
      // https://github.com/samijaber/builder/blob/ssr-support/packages/react/src/functions/string-to-function.ts#L51
      // 'block',
      useCode
    );
    console.log('2');
    const out = fn(
      builder,
      builder,
      options.state,
      options.context,
      options.event
      // might need to add something like this, but where do we get `block` from?
      // I should look at how react SDK does this. what calls this function all the way at the top
      // both here and in React SDK
      // https://github.com/samijaber/builder/blob/ssr-support/packages/react/src/functions/string-to-function.ts#L51
      // options.block
    );
    console.log('3');

    return out;
  } catch (e) {
    console.warn('Builder custom code error: ', e);
    console.warn('===== EXTRA LOGS ======');
    console.warn(options);
    console.warn('===== END LOGS ======');
  }
}
