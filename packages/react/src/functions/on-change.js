'use strict';

const PATH_SEPARATOR = '.';
const TARGET = Symbol('target');
const UNSUBSCRIBE = Symbol('unsubscribe');

const isPrimitive = value => value === null || (typeof value !== 'object' && typeof value !== 'function');

const isBuiltinWithoutMutableMethods = value => value instanceof RegExp || value instanceof Number;

const isBuiltinWithMutableMethods = value => value instanceof Date;

const concatPath = (path, property) => {
	if (property && property.toString) {
		if (path) {
			path += PATH_SEPARATOR;
		}

		path += property.toString();
	}

	return path;
};

const walkPath = (path, callback) => {
	let index;

	while (path) {
		index = path.indexOf(PATH_SEPARATOR);

		if (index === -1) {
			index = path.length;
		}

		callback(path.slice(0, index));

		path = path.slice(index + 1);
	}
};

const shallowClone = value => {
	if (Array.isArray(value)) {
		return value.slice();
	}

	return Object.assign({}, value);
};

const onChange = (object, onChange, options = {}) => {
	const proxyTarget = Symbol('ProxyTarget');
	let inApply = false;
	let changed = false;
	let applyPath;
	let applyPrevious;
	let isUnsubscribed = false;
	const equals = options.equals || Object.is;
	let propCache = new WeakMap();
	let pathCache = new WeakMap();
	let proxyCache = new WeakMap();

	const handleChange = (path, property, previous, value) => {
		if (isUnsubscribed) {
			return;
		}

		if (!inApply) {
			onChange(concatPath(path, property), value, previous);
			return;
		}

		if (inApply && applyPrevious && previous !== undefined && value !== undefined && property !== 'length') {
			let item = applyPrevious;

			if (path !== applyPath) {
				path = path.replace(applyPath, '').slice(1);

				walkPath(path, key => {
					item[key] = shallowClone(item[key]);
					item = item[key];
				});
			}

			item[property] = previous;
		}

		changed = true;
	};

	const getOwnPropertyDescriptor = (target, property) => {
		let props = propCache ? propCache.get(target) : undefined;

		if (props) {
			return props;
		}

		props = new Map();
		propCache.set(target, props);

		let prop = props.get(property);
		if (!prop) {
			prop = Reflect.getOwnPropertyDescriptor(target, property);
			props.set(property, prop);
		}

		return prop;
	};

	const invalidateCachedDescriptor = (target, property) => {
		const props = propCache ? propCache.get(target) : undefined;

		if (props) {
			props.delete(property);
		}
	};

	const buildProxy = (value, path) => {
		if (isUnsubscribed) {
			return value;
		}

		pathCache.set(value, path);

		let proxy = proxyCache.get(value);

		if (proxy === undefined) {
			proxy = new Proxy(value, handler);
			proxyCache.set(value, proxy);
		}

		return proxy;
	};

	const unsubscribe = target => {
		isUnsubscribed = true;
		propCache = null;
		pathCache = null;
		proxyCache = null;

		return target;
	};

	const ignoreChange = property => {
		return isUnsubscribed || (options.ignoreSymbols === true && typeof property === 'symbol');
	};

	const handler = {
		get(target, property, receiver) {
			if (property === proxyTarget || property === TARGET) {
				return target;
			}

			if (property === UNSUBSCRIBE && pathCache.get(target) === '') {
				return unsubscribe(target);
			}

			const value = Reflect.get(target, property, receiver);
			if (
				isPrimitive(value) ||
				isBuiltinWithoutMutableMethods(value) ||
				property === 'constructor' ||
				options.isShallow === true
			) {
				return value;
			}

			// Preserve invariants
			const descriptor = getOwnPropertyDescriptor(target, property);
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

		set(target, property, value, receiver) {
			if (value && value[proxyTarget] !== undefined) {
				value = value[proxyTarget];
			}

			const ignore = ignoreChange(property);
			const previous = ignore ? null : Reflect.get(target, property, receiver);
			const result = Reflect.set(target[proxyTarget] || target, property, value);

			if (!ignore && !equals(previous, value)) {
				handleChange(pathCache.get(target), property, previous, value);
			}

			return result;
		},

		defineProperty(target, property, descriptor) {
			const result = Reflect.defineProperty(target, property, descriptor);

			if (!ignoreChange(property)) {
				invalidateCachedDescriptor(target, property);

				handleChange(pathCache.get(target), property, undefined, descriptor.value);
			}

			return result;
		},

		deleteProperty(target, property) {
			if (!Reflect.has(target, property)) {
				return true;
			}

			const ignore = ignoreChange(property);
			const previous = ignore ? null : Reflect.get(target, property);
			const result = Reflect.deleteProperty(target, property);

			if (!ignore) {
				invalidateCachedDescriptor(target, property);

				handleChange(pathCache.get(target), property, previous);
			}

			return result;
		},

		apply(target, thisArg, argumentsList) {
			const compare = isBuiltinWithMutableMethods(thisArg);

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

				const result = Reflect.apply(target, thisArg, argumentsList);

				inApply = false;

				if (changed || (compare && !equals(applyPrevious, thisArg.valueOf()))) {
					handleChange(applyPath, '', applyPrevious, thisArg[proxyTarget] || thisArg);
					applyPrevious = null;
					changed = false;
				}

				return result;
			}

			return Reflect.apply(target, thisArg, argumentsList);
		}
	};

	const proxy = buildProxy(object, '');
	onChange = onChange.bind(proxy);

	return proxy;
};

onChange.target = proxy => proxy[TARGET] || proxy;
onChange.unsubscribe = proxy => proxy[UNSUBSCRIBE] || proxy;

module.exports = onChange;
// TODO: Remove this for the next major release
module.exports.default = onChange;
