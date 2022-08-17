export function markMutable<T>(value: T): T {
  return value;
}

export function markPropsMutable<T>(props: T): T {
  return props;
}
