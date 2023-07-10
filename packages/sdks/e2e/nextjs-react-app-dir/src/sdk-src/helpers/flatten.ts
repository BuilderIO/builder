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
