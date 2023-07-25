import type { Prettify } from './typescript.js';
type OptionalFieldsOnly<T> = { [K in keyof T as T[K] extends Required<T>[K] ? never : K]: T[K] };
type RequiredFieldsOnly<T> = { [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K] };
type Enforced<T> = { [K in keyof T]-?: T[K] };
type AndUndefined<T> = { [K in keyof T]: T[K] | undefined };

/**
 * Enforce that all optional fields are undefined
 * @example
 * type Foo = { a: string, b?: number }
 * type Bar = EnforcePartials<Foo> // { a: string, b: number | undefined }
 */
export type EnforcePartials<From> = Prettify<AndUndefined<Enforced<OptionalFieldsOnly<From>>> & RequiredFieldsOnly<From>>