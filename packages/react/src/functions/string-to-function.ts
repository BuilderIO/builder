import { Builder, builder } from '@builder.io/sdk';
import { safeDynamicRequire } from './safe-dynamic-require';

const fnCache: { [key: string]: BuilderEvanFunction | undefined } = {};

type BuilderEvanFunction = (
  state: object,
  event?: Event | undefined | null,
  block?: any,
  builder?: Builder,
  Device?: any,
  update?: Function | null,
  _Builder?: typeof Builder,
  context?: object
) => any;

export const api = (state: any) => builder;

export function stringToFunction(
  str: string,
  expression = true,
  errors?: Error[],
  logs?: string[]
): BuilderEvanFunction {
  /* TODO: objedct */
  if (!str || !str.trim()) {
    return () => undefined;
  }

  const cacheKey = str + ':' + expression;
  if (fnCache[cacheKey]) {
    return fnCache[cacheKey]!;
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
    if (Builder.isBrowser) {
      // TODO: use strict and eval
      fn = new Function(
        'state',
        'event',
        'block',
        'builder',
        'Device',
        'update',
        'Builder',
        'context',
        // TODO: remove the with () {} - make a page v3 that doesn't use this
        // Or only do if can't find state\s*\. anywhere hm
        `
          var names = [
            'state',
            'event',
            'block',
            'builder',
            'Device',
            'update',
            'Builder',
            'context'
          ];
          var rootState = state;
          if (typeof Proxy !== 'undefined') {
            rootState = new Proxy(rootState, {
              set: function () {
                return false;
              },
              get: function (target, key) {
                if (names.includes(key)) {
                  return undefined;
                }
                return target[key];
              }
            });
          }
          /* Alias */
          var ctx = context;
          with (rootState) {
            ${useReturn ? `return (${str});` : str};
          }
        `
      );
    }
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
    if (Builder.isBrowser) {
      console.warn(`Function compile error in ${str}`, error);
    }
  }

  const final = (...args: any[]) => {
    try {
      if (Builder.isBrowser) {
        return fn(...args);
      } else {
        // TODO: memoize on server
        // TODO: use something like this instead https://www.npmjs.com/package/rollup-plugin-strip-blocks
        // There must be something more widely used?
        // TODO: regex for between comments instead so can still type check the code... e.g. //SERVER-START ... code ... //SERVER-END
        // Below is a hack to get certain code to *only* load in the server build, to not screw with
        // browser bundler's like rollup and webpack. Our rollup plugin strips these comments only
        // for the server build
        // TODO: cache these for better performancs with new VmScript
        // tslint:disable:comment-format
        const { VM } = safeDynamicRequire('vm2');
        const [state, event] = args;
        return new VM({
          timeout: 100,
          sandbox: {
            ...state,
            ...{ state },
            ...{ builder: api },
            event,
          },
        }).run(str.replace(/(^|;)return /, '$1'));
        // tslint:enable:comment-format
      }
    } catch (error) {
      if (Builder.isBrowser) {
        console.warn(
          'Builder custom code error:',
          error.message || error,
          'in',
          str,
          error.stack || error
        );
      } else {
        if (process.env.DEBUG) {
          console.debug(
            'Builder custom code error:',
            error.message || error,
            'in',
            str,
            error.stack || error
          );
        }
      }
      if (errors) {
        errors.push(error);
      }
    }
  };

  if (Builder.isBrowser) {
    fnCache[cacheKey] = final;
  }

  return final;
}
