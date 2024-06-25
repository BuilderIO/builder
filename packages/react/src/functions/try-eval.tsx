'use client';
import { Builder } from '@builder.io/sdk';
import { safeDynamicRequire } from './safe-dynamic-require';
import { isDebug } from './is-debug';
import { getIsolateContext, makeFn } from './string-to-function';
import { shouldForceBrowserRuntimeInNode } from './should-force-browser-runtime-in-node';

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
    if (Builder.isBrowser || shouldForceBrowserRuntimeInNode()) {
      return fn(data || {});
    } else {
      // Below is a hack to get certain code to *only* load in the server build, to not screw with
      // browser bundler's like rollup and webpack. Our rollup plugin strips these comments only
      // for the server build
      const ivm = safeDynamicRequire('isolated-vm');
      const context = getIsolateContext();
      const fnString = makeFn(str!, useReturn, ['state']);
      const resultStr = context.evalClosureSync(fnString, [new ivm.Reference(data || {})]);
      try {
        // returning objects throw errors in isolated vm, so we stringify it and parse it back
        return JSON.parse(resultStr);
      } catch (_error: any) {
        return resultStr;
      }
    }
  } catch (error: any) {
    if (errors) {
      errors.push(error);
    }

    if (Builder.isBrowser) {
      console.warn('Builder custom code error:', error.message, 'in', str, error.stack);
    } else {
      if (isDebug()) {
        console.debug('Builder custom code error:', error.message, 'in', str, error.stack);
      }
      // Add to req.options.errors to return to client
    }
  }

  return;
};
