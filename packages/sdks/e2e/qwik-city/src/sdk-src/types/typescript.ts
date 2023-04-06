export type Nullable<T> = T | null | undefined;

export type Dictionary<T> = { [key: string]: T };

export type Overwrite<T, U> = keyof U extends keyof T
  ? Pick<T, Exclude<keyof T, keyof U>> & U
  : never;
