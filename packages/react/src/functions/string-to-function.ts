import { Builder, builder } from '@builder.io/sdk'
import { sizes } from '../constants/device-sizes.constant'

const fnCache: { [key: string]: Function } = {}

const sizeMap = {
  desktop: 'large',
  tablet: 'medium',
  mobile: 'small'
}

export const api = (state: any) => ({
  // TODO: trigger animation
  use: (value: any) => value,
  useText: (value: any) => value,
  useSwitch: (value: any) => value,
  useNumber: (value: any) => value,
  run: (cb: Function) => cb(),
  return: (value: any) => value,
  set: (name: string, value: any) => {
    // need reference to state to set
    state[name] = value
  },
  get: (name: string, value: any) => {
    // need reference to state to set
    return state[name]
  },
  get device() {
    return Builder.isBrowser
      ? ['large', 'medium', 'small'].indexOf(sizes.getSizeForWidth(window.innerWidth))
      : // builder reference no good...? get mixed up across requests...? need to use context...?
        sizeMap[builder.getUserAttributes().device!] || 'large'
  },
  deviceIs(device: number) {
    return this.device === device
  },
  isBrowser: Builder.isBrowser
})

export function stringToFunction(
  str: string,
  expression = true,
  errors?: Error[],
  logs?: string[]
) {
  if (!str || !str.trim()) {
    return () => undefined
  }

  const cacheKey = str + ':' + expression
  if (fnCache[cacheKey]) {
    return fnCache[cacheKey]
  }

  // FIXME: gross hack
  const useReturn =
    (expression &&
      !(str.includes(';') || str.includes(' return ') || str.trim().startsWith('return '))) ||
    str.trim().startsWith('builder.run')
  let fn: Function = () => {
    /* intentionally empty */
  }

  str = str
    .replace(/builder\s*\.\s*use[a-zA-Z]*\(/g, 'return(')
    .replace(/builder\s*\.\s*set([a-zA-Z]+)To\(/g, (_match, group: string) => {
      return `builder.set("${group[0].toLowerCase() + group.substring(1)}",`
    })
    .replace(/builder\s*\.\s*get([a-zA-Z]+)\s*\(\s*\)/g, (_match, group: string) => {
      return `state.${group[0].toLowerCase() + group.substring(1)}`
    })

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
      )
    }
  } catch (error) {
    if (errors) {
      errors.push(error)
    }
    const message = error && error.message
    if (message && typeof message === 'string') {
      if (logs && logs.indexOf(message) === -1) {
        logs.push(message)
      }
    }
    if (Builder.isBrowser) {
      console.warn(`Function compile error in ${str}`, error)
    }
  }

  const final = (fnCache[cacheKey] = (...args: any[]) => {
    try {
      if (Builder.isBrowser) {
        return fn(...args)
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
        ///SERVERONLY const { VM } = require('vm2')
        ///SERVERONLY const [state, event] = args
        ///SERVERONLY return new VM({
        ///SERVERONLY   timeout: 100,
        ///SERVERONLY   sandbox: {
        ///SERVERONLY     ...state,
        ///SERVERONLY     ...{ state },
        ///SERVERONLY     ...{ builder: api },
        ///SERVERONLY     event
        ///SERVERONLY   }
        ///SERVERONLY }).run(str.replace(/^return /, ''))
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
        )
      } else {
        if (process.env.DEBUG) {
          console.debug(
            'Builder custom code error:',
            error.message || error,
            'in',
            str,
            error.stack || error
          )
        }
      }
      if (errors) {
        errors.push(error)
      }
    }
  })

  return final
}
