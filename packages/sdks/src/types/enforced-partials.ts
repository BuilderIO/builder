import type { Prettify } from './typescript.js';

/**
 * Lol Typescript
 * https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
 */
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

type OptionalFieldsOnly<T> = {
  [K in keyof T as T[K] extends Required<T>[K]
    ? IfAny<T[K], K, never>
    : K]: T[K];
};

type RequiredFieldsOnly<T> = {
  [K in keyof T as T[K] extends Required<T>[K]
    ? IfAny<T[K], never, K>
    : never]: T[K];
};

type Enforced<T> = {
  [K in keyof T]-?: T[K];
};

type AndUndefined<T> = {
  [K in keyof T]: T[K] | undefined;
};

/**
 * Enforce that all optional fields are undefined
 * @example
 * type Foo = { a: string, b?: number }
 * type Bar = EnforcePartials<Foo> // { a: string, b: number | undefined }
 */
export type EnforcePartials<From> = Prettify<
  AndUndefined<Enforced<OptionalFieldsOnly<From>>> & RequiredFieldsOnly<From>
>;
