/**
 * Deep-copies plain objects and arrays (anything else is kept by reference), so
 * that state writes made while rendering never reach the content object, which
 * apps often cache and share between requests.
 */
export const copyPlainData = <T>(
  value: T,
  seen = new WeakMap<object, any>()
): T => {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  if (Array.isArray(value)) {
    const copy: any[] = [];
    seen.set(value, copy);
    for (let i = 0; i < value.length; i++) {
      copy[i] = copyPlainData(value[i], seen);
    }
    return copy as T;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return value;
  const copy: Record<string, any> = {};
  seen.set(value, copy);
  for (const key of Object.keys(value)) {
    const copied = copyPlainData((value as any)[key], seen);
    if (key === '__proto__') {
      // Assigning would call the prototype setter; JSON can carry `__proto__` as an own key.
      Object.defineProperty(copy, key, {
        value: copied,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    } else {
      copy[key] = copied;
    }
  }
  return copy as T;
};
