// TO-DO: import real content type from SDKs
export interface Breakpoints {
  small: number;
  medium: number;
}
export type Nullable<T> = T | null | undefined;
export type BuilderContent = Partial<{
  id?: string;
  data: { [index: string]: any };
  meta?: { breakpoints?: Nullable<Breakpoints>; [index: string]: any };
}>;

type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

export interface BuilderBlock {
  '@type': '@builder.io/sdk:Element';
  '@version'?: number;
  id?: string;
  tagName?: string;
  layerName?: string;
  groupLocked?: boolean;
  layerLocked?: boolean;
  /** @todo make alias for properties.class */
  class?: string;
  children?: BuilderBlock[];
  responsiveStyles?: {
    large?: Partial<CSSStyleDeclaration>;
    medium?: Partial<CSSStyleDeclaration>;
    small?: Partial<CSSStyleDeclaration>;
    /** @deprecated */
    xsmall?: Partial<CSSStyleDeclaration>;
  };
  component?: {
    name: string;
    options?: any;
    tag?: string;
  };
  bindings?: {
    [key: string]: string;
  };
  meta?: {
    [key: string]: JSONValue;
  };
  actions?: {
    [key: string]: string;
  };
  properties?: {
    [key: string]: string;
  };
  code?: {
    bindings?: {
      [key: string]: string;
    };
    actions?: {
      [key: string]: string;
    };
  };
  repeat?: {
    collection: string;
    itemName?: string;
  } | null;
  animations?: any[]; // TODO: type the animation spec
  style?: Partial<CSSStyleDeclaration>;

  /**
   * generated by the "Hide If" binding
   */
  hide?: boolean;

  /**
   * generated by the "Show If" binding
   */
  show?: boolean;
}
