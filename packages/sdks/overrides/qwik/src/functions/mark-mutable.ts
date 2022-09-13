import { mutable } from '@builder.io/qwik';

export function markMutable<T>(value: T): T {
  return mutable(value) as any;
}

export function markPropsMutable<T>(props: T): T {
  Object.keys(props).forEach((key) => {
    (props as any)[key] = mutable((props as any)[key]);
  });
  return props;
}
