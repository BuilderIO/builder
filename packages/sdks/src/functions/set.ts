/**
 * Minimal implementation of lodash's _.set
 * https://lodash.com/docs/4.17.15#set
 *
 * See ./set.test.ts for usage examples
 */
export const set = (obj: any, _path: string | string[], value: any) => {
  if (Object(obj) !== obj) {
    return obj;
  }
  const path: string[] = Array.isArray(_path)
    ? _path
    : (_path.toString().match(/[^.[\]]+/g) as string[]);

  path
    .slice(0, -1)
    .reduce(
      (a, c, i) =>
        Object(a[c]) === a[c]
          ? a[c]
          : (a[c] =
              Math.abs(Number(path[i + 1])) >> 0 === +path[i + 1] ? [] : {}),
      obj
    )[path[path.length - 1]] = value;
  return obj;
};

const isArrayIndex = (key: string | undefined) =>
  Math.abs(Number(key)) >> 0 === +key!;

/**
 * Like `set`, but every object or array along `path` that is not in `copied`
 * is shallow-copied before being written to, so objects shared with the
 * original are never mutated. `obj` itself must already be a copy.
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
  const path = _path.toString().match(/[^.[\]]+/g) as string[] | null;
  if (!path) {
    return obj;
  }
  copied.add(obj);

  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    let next = current[key];
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
