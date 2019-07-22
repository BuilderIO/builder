const fnCache: { [key: string]: Function } = {};

export function stringToFunction(
  str: string,
  expression = true,
  errors?: Error[],
  logs?: string[]
) {
  if (!str || !str.trim()) {
    return () => undefined;
  }

  const cacheKey = str + ':' + expression;
  if (fnCache[cacheKey]) {
    return fnCache[cacheKey];
  }

  // FIXME: gross hack
  const useReturn =
    (expression &&
      !(str.includes(';') || str.includes(' return ') || str.trim().startsWith('return '))) ||
    str.trim().startsWith('builder.run');
  let fn: Function = () => {
    /* intentionally empty */
  };

  try {
    // tslint:disable-next-line:no-function-constructor-with-string-args
    // TODO: use strict and eval
    fn = new Function(
      'state',
      'event',
      'block',
      'builder',
      'Device',
      'update',
      // TODO: block reference...
      // TODO: or just remove with (rootState) in general
      `
          var rootState = state;
          if (typeof Proxy !== 'undefined') {
            rootState = new Proxy(rootState, {
              set: function () {
                return false;
              }
            });
          }
          with (rootState) {
            ${useReturn ? `return (${str});` : str};
          }
        `
    );
  } catch (error) {
    if (errors) {
      errors.push(error);
    }
    const message = error && error.message;
    if (message && typeof message === 'string') {
      if (logs && logs.indexOf(message) === -1) {
        logs.push(message);
      }
    }

    console.warn(`Function compile error in ${str}`, error);
  }

  const final = (fnCache[cacheKey] = (...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      console.warn('Builder custom code error:', error.message, error.stack);
      if (errors) {
        errors.push(error);
      }
    }
  });

  return final;
}
