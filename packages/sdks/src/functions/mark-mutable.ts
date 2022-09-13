export function markMutable<T = any>(value: T): T {
  return value;
}

export function markPropsMutable<T = any>(props: T): T {
  return props;
}
