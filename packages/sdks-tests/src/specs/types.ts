// TO-DO: import real content type from SDKs
export interface Breakpoints {
  small: number;
  medium: number;
}
export type Nullable<T> = T | null | undefined;
export type BuilderContent = Partial<{
  data: { [index: string]: any };
  meta?: { breakpoints?: Nullable<Breakpoints>; [index: string]: any };
}>;
