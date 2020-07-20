// Via https://github.com/sindresorhus/on-change but
// compiled for ES5

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
('use strict');
var PATH_SEPARATOR = '.';
var TARGET = Symbol('target');
var UNSUBSCRIBE = Symbol('unsubscribe');
var isPrimitive = function (value) {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
};
var isBuiltinWithoutMutableMethods = function (value) {
  return value instanceof RegExp || value instanceof Number;
};
var isBuiltinWithMutableMethods = function (value) {
  return value instanceof Date;
};
var concatPath = function (path, property) {
  if (property && property.toString) {
    if (path) {
      path += PATH_SEPARATOR;
    }
    path += property.toString();
  }
  return path;
};
var walkPath = function (path, callback) {
  var index;
  while (path) {
    index = path.indexOf(PATH_SEPARATOR);
    if (index === -1) {
      index = path.length;
    }
    callback(path.slice(0, index));
    path = path.slice(index + 1);
  }
};
var shallowClone = function (value) {
  if (Array.isArray(value)) {
    return value.slice();
  }
  return Object.assign({}, value);
};
var onChange = function (object, onChange, options) {
  if (typeof Proxy === 'undefined') {
    // TODO: use immer? or a technique like immer to diff maybe
    return object;
  }
  if (options === void 0) {
    options = {};
  }
  var proxyTarget = Symbol('ProxyTarget');
  var inApply = false;
  var changed = false;
  var applyPath;
  var applyPrevious;
  var isUnsubscribed = false;
  var equals = options.equals || Object.is;
  var propCache = new WeakMap();
  var pathCache = new WeakMap();
  var proxyCache = new WeakMap();
  var handleChange = function (path, property, previous, value) {
    if (isUnsubscribed) {
      return;
    }
    if (!inApply) {
      onChange(concatPath(path, property), value, previous);
      return;
    }
    if (
      inApply &&
      applyPrevious &&
      previous !== undefined &&
      value !== undefined &&
      property !== 'length'
    ) {
      var item_1 = applyPrevious;
      if (path !== applyPath) {
        path = path.replace(applyPath, '').slice(1);
        walkPath(path, function (key) {
          item_1[key] = shallowClone(item_1[key]);
          item_1 = item_1[key];
        });
      }
      item_1[property] = previous;
    }
    changed = true;
  };
  var getOwnPropertyDescriptor = function (target, property) {
    var props = propCache ? propCache.get(target) : undefined;
    if (props) {
      return props;
    }
    props = new Map();
    propCache.set(target, props);
    var prop = props.get(property);
    if (!prop) {
      prop = Reflect.getOwnPropertyDescriptor(target, property);
      props.set(property, prop);
    }
    return prop;
  };
  var invalidateCachedDescriptor = function (target, property) {
    var props = propCache ? propCache.get(target) : undefined;
    if (props) {
      props.delete(property);
    }
  };
  var buildProxy = function (value, path) {
    if (isUnsubscribed) {
      return value;
    }
    pathCache.set(value, path);
    var proxy = proxyCache.get(value);
    if (proxy === undefined) {
      proxy = new Proxy(value, handler);
      proxyCache.set(value, proxy);
    }
    return proxy;
  };
  var unsubscribe = function (target) {
    isUnsubscribed = true;
    propCache = null;
    pathCache = null;
    proxyCache = null;
    return target;
  };
  var ignoreChange = function (property) {
    return isUnsubscribed || (options.ignoreSymbols === true && typeof property === 'symbol');
  };
  var handler = {
    get: function (target, property, receiver) {
      if (property === proxyTarget || property === TARGET) {
        return target;
      }
      if (property === UNSUBSCRIBE && pathCache.get(target) === '') {
        return unsubscribe(target);
      }
      var value = Reflect.get(target, property, receiver);
      if (
        isPrimitive(value) ||
        isBuiltinWithoutMutableMethods(value) ||
        property === 'constructor' ||
        options.isShallow === true
      ) {
        return value;
      }
      // Preserve invariants
      var descriptor = getOwnPropertyDescriptor(target, property);
      if (descriptor && !descriptor.configurable) {
        if (descriptor.set && !descriptor.get) {
          return undefined;
        }
        if (descriptor.writable === false) {
          return value;
        }
      }
      return buildProxy(value, concatPath(pathCache.get(target), property));
    },
    set: function (target, property, value, receiver) {
      if (value && value[proxyTarget] !== undefined) {
        value = value[proxyTarget];
      }
      var ignore = ignoreChange(property);
      var previous = ignore ? null : Reflect.get(target, property, receiver);
      var result = Reflect.set(target[proxyTarget] || target, property, value);
      if (!ignore && !equals(previous, value)) {
        handleChange(pathCache.get(target), property, previous, value);
      }
      return result;
    },
    defineProperty: function (target, property, descriptor) {
      var result = Reflect.defineProperty(target, property, descriptor);
      if (!ignoreChange(property)) {
        invalidateCachedDescriptor(target, property);
        handleChange(pathCache.get(target), property, undefined, descriptor.value);
      }
      return result;
    },
    deleteProperty: function (target, property) {
      if (!Reflect.has(target, property)) {
        return true;
      }
      var ignore = ignoreChange(property);
      var previous = ignore ? null : Reflect.get(target, property);
      var result = Reflect.deleteProperty(target, property);
      if (!ignore) {
        invalidateCachedDescriptor(target, property);
        handleChange(pathCache.get(target), property, previous);
      }
      return result;
    },
    apply: function (target, thisArg, argumentsList) {
      var compare = isBuiltinWithMutableMethods(thisArg);
      if (compare) {
        thisArg = thisArg[proxyTarget];
      }
      if (!inApply) {
        inApply = true;
        if (compare) {
          applyPrevious = thisArg.valueOf();
        }
        if (Array.isArray(thisArg) || toString.call(thisArg) === '[object Object]') {
          applyPrevious = shallowClone(thisArg[proxyTarget]);
        }
        applyPath = pathCache.get(target);
        applyPath = applyPath.slice(0, Math.max(applyPath.lastIndexOf(PATH_SEPARATOR), 0));
        var result = Reflect.apply(target, thisArg, argumentsList);
        inApply = false;
        if (changed || (compare && !equals(applyPrevious, thisArg.valueOf()))) {
          handleChange(applyPath, '', applyPrevious, thisArg[proxyTarget] || thisArg);
          applyPrevious = null;
          changed = false;
        }
        return result;
      }
      return Reflect.apply(target, thisArg, argumentsList);
    },
  };
  var proxy = buildProxy(object, '');
  onChange = onChange.bind(proxy);
  return proxy;
};
onChange.target = function (proxy) {
  return proxy[TARGET] || proxy;
};
onChange.unsubscribe = function (proxy) {
  return proxy[UNSUBSCRIBE] || proxy;
};
module.exports = onChange;
exports.default = onChange;
