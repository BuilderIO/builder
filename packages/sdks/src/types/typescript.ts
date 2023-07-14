export type Nullable<T> = T | null | undefined;

export type Dictionary<T> = { [key: string]: T };

export type Overwrite<T, U> = keyof U extends keyof T
  ? Pick<T, Exclude<keyof T, keyof U>> & U
  : never;

export type NullableObject<T extends object> = {
  [P in keyof T]: Nullable<T[P]>;
};

export type MarkUndefined<T> = { [P in keyof T]: T[P] | undefined };
