const parsePath = (path: string) =>
  path.toString().match(/[^.[\]]+/g) as string[] | null;

const isArrayIndex = (key: string | undefined) =>
  Math.abs(Number(key)) >> 0 === +key!;

/**
 * `__proto__` is never allowed. `constructor` and `prototype` are allowed only as
 * the final key, where they are written as ordinary own properties.
 */
const hasUnsafeSegment = (path: string[]) =>
  path.some(
    (key, i) =>
      key === '__proto__' ||
      (i < path.length - 1 && (key === 'constructor' || key === 'prototype'))
  );

/**
 * Own properties only, so a path can never walk into a value shared through a
 * prototype (e.g. `Object.prototype.toString`) and mutate it.
 */
const getOwn = (obj: any, key: string) =>
  Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;

/**
 * Minimal implementation of lodash's _.set
 * https://lodash.com/docs/4.17.15#set
 *
 * Mutates `obj` in place, creating missing objects/arrays along the path:
 *
 *   const obj = { a: { b: 1 } };
 *   set(obj, 'a.c', 2);      // obj is { a: { b: 1, c: 2 } }
 *   set(obj, 'list.0', 'x'); // obj.list is ['x']
 *
 * See ./set.test.ts for more usage examples
 */
export const set = (obj: any, _path: string | string[], value: any) => {
  if (Object(obj) !== obj) {
    return obj;
  }
  const path: string[] = Array.isArray(_path)
    ? _path
    : (parsePath(_path) as string[]);

  if (!path || hasUnsafeSegment(path)) {
    return obj;
  }

  path.slice(0, -1).reduce((a, c, i) => {
    const next = getOwn(a, c);
    return Object(next) === next
      ? next
      : (a[c] = isArrayIndex(path[i + 1]) ? [] : {});
  }, obj)[path[path.length - 1]] = value;
  return obj;
};

/**
 * Like `set`, but every object or array along `path` that is not in `copied`
 * is shallow-copied before being written to, so objects shared with the
 * original are never mutated. `obj` itself must already be a copy.
 *
 *   const block = { options: { text: 'a' }, style: { color: 'red' } };
 *   const copy = { ...block };
 *   setCopyOnWrite(copy, 'options.text', 'b', new WeakSet());
 *   // copy.options is a new object: { text: 'b' }
 *   // block.options.text is still 'a'
 *   // copy.style === block.style (untouched branches stay shared)
 */
export const setCopyOnWrite = (
  obj: any,
  _path: string,
  value: any,
  copied: WeakSet<object>
) => {
  if (Object(obj) !== obj) {
    return obj;
  }
  const path = parsePath(_path);
  if (!path || hasUnsafeSegment(path)) {
    return obj;
  }
  copied.add(obj);

  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    let next = getOwn(current, key);
    if (Object(next) !== next) {
      next = isArrayIndex(path[i + 1]) ? [] : {};
      copied.add(next);
      current[key] = next;
    } else if (typeof next === 'object' && !copied.has(next)) {
      next = Array.isArray(next) ? next.slice() : { ...next };
      copied.add(next);
      current[key] = next;
    }
    current = next;
  }
  current[path[path.length - 1]] = value;
  return obj;
};

/**
 * Deletes the property at `path`, the inverse of `set` for an array path.
 * Mutates `obj` in place and does nothing when a parent is missing:
 *
 *   const obj = { a: { b: 1, c: 2 } };
 *   unset(obj, ['a', 'b']); // obj is { a: { c: 2 } }
 *   unset(obj, ['x', 'y']); // no-op
 */
export const unset = (obj: any, path: string[]) => {
  if (Object(obj) !== obj || !path.length || hasUnsafeSegment(path)) {
    return obj;
  }
  const parent = path
    .slice(0, -1)
    .reduce((a, c) => (Object(a) === a ? getOwn(a, c) : undefined), obj);
  if (Object(parent) === parent) {
    delete parent[path[path.length - 1]];
  }
  return obj;
};
