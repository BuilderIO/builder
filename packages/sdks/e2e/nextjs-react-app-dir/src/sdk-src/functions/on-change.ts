export const onChangeProxySymbol = Symbol('onChangeProxySymbol');

/**
 * Deeply observe an object and run a callback when it changes
 *
 * See ./on-change.test.ts for more info
 */
export function onChange<T extends object = any>(obj: T, cb: () => void): T {
  return new Proxy(obj, {
    get(target, key) {
      if (key === onChangeProxySymbol) {
        return true;
      }
      const value = Reflect.get(target, key);
      if (value && typeof value === 'object') {
        if ((value as any)[onChangeProxySymbol]) {
          return value;
        }
        return onChange(value, cb);
      }
      return value;
    },
    set(target, key, value) {
      const returnValue = Reflect.set(target, key, value);
      cb();
      return returnValue;
    },
  });
}
