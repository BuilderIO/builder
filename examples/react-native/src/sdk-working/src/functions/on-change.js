const onChangeProxySymbol = Symbol("onChangeProxySymbol");
function onChange(obj, cb) {
  return new Proxy(obj, {
    get(target, key) {
      if (key === onChangeProxySymbol) {
        return true;
      }
      const value = Reflect.get(target, key);
      if (value && typeof value === "object") {
        if (value[onChangeProxySymbol]) {
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
    }
  });
}
export {
  onChange,
  onChangeProxySymbol
};
