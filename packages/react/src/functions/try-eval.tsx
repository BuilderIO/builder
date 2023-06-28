'use client';
import { Builder } from '@builder.io/sdk';
import { safeDynamicRequire } from './safe-dynamic-require';

export const tryEval = (str?: string, data: any = {}, errors?: Error[]): any => {
  const value = str;
  if (!(typeof value === 'string' && value.trim())) {
    return;
  }
  const useReturn = !(value.includes(';') || value.includes(' return '));
  let fn: Function = () => {
    /* Intentionally empty */
  };
  try {
    if (Builder.isBrowser) {
      // tslint:disable-next-line:no-function-constructor-with-string-args
      // TODO: VM in node......
      fn = new Function(
        'state',
        // TODO: remove the with () {} - make a page v3 that doesn't use this
        `var rootState = state;
        if (typeof Proxy !== 'undefined') {
          rootState = new Proxy(rootState, {
            set: function () {
              return false;
            },
            get: function (target, key) {
              if (key === 'state') {
                return state;
              }
              return target[key]
            }
          });
        }
        with (rootState) {
          ${useReturn ? `return (${str});` : str};
        }`
      );
    }
  } catch (error: any) {
    if (Builder.isBrowser) {
      console.warn('Could not compile javascript', error);
    } else {
      // Add to req.options.errors to return to client
    }
  }
  try {
    if (Builder.isBrowser) {
      return fn(data || {});
    } else {
      // Below is a hack to get certain code to *only* load in the server build, to not screw with
      // browser bundler's like rollup and webpack. Our rollup plugin strips these comments only
      // for the server build
      // tslint:disable:comment-format
      const { VM } = safeDynamicRequire('vm2');
      return new VM({
        sandbox: {
          ...data,
          ...{ state: data },
        },
        // TODO: convert reutrn to module.exports on server
      }).run(value.replace(/(^|;)return /, '$1'));
      // tslint:enable:comment-format
    }
  } catch (error: any) {
    if (errors) {
      errors.push(error);
    }

    if (Builder.isBrowser) {
      console.warn('Builder custom code error:', error.message, 'in', str, error.stack);
    } else {
      if (process?.env?.DEBUG) {
        console.debug('Builder custom code error:', error.message, 'in', str, error.stack);
      }
      // Add to req.options.errors to return to client
    }
  }

  return;
};
