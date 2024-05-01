/**
 * Convert deep object to a flat object with dots
 *
 * { foo: { bar: 'baz' }} -> { 'foo.bar': 'baz' }
 */
export function flatten<T extends Record<string, any>>(
  object: T,
  path: string | null = null,
  separator = '.'
): T {
  return Object.keys(object).reduce((acc: T, key: string): T => {
    const value = object[key];
    const newPath = [path, key].filter(Boolean).join(separator);
    const isObject = [
      typeof value === 'object',
      value !== null,
      !(Array.isArray(value) && value.length === 0),
    ].every(Boolean);

    return isObject
      ? { ...acc, ...flatten(value, newPath, separator) }
      : { ...acc, [newPath]: value };
  }, {} as T);
}

/**
 * Flatten a nested MongoDB query object into a flat object with dot-separated keys.
 * $ keys are not flattened and are left as is.
 *
 * { foo: { bar: { $gt: 5 }}} -> { 'foo.bar': { '$gt': 5 }}
 * { foo: {'bar.id': { $elemMatch: { 'baz.id': { $in: ['abc', 'bcd'] }}}}} -> { 'foo.bar.id': { '$elemMatch': { 'baz.id': { '$in': ['abc', 'bcd'] }}}}
 */
export function flattenMongoQuery(
  obj: any,
  _current?: any,
  _res: any = {}
): { [key: string]: string } {
  for (const key in obj) {
    const value = obj[key];
    const newKey = _current ? _current + '.' + key : key;
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !Object.keys(value).find((item) => item.startsWith('$'))
    ) {
      flattenMongoQuery(value, newKey, _res);
    } else {
      _res[newKey] = value;
    }
  }
  return _res;
}
