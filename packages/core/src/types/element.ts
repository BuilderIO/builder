type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

export type SerializableCSSStyleDeclaration = Partial<Record<keyof CSSStyleDeclaration, string>>;

/**
 * An object representing an element in Builder
 */
export interface BuilderElement {
  '@type': '@builder.io/sdk:Element';
  '@version'?: number;
  id?: string;
  tagName?: string;
  layerName?: string;
  groupLocked?: boolean;
  layerLocked?: boolean;
  /** @deprecated @hidden */
  class?: string;
  children?: BuilderElement[];
  responsiveStyles?: {
    large?: SerializableCSSStyleDeclaration;
    medium?: SerializableCSSStyleDeclaration;
    small?: SerializableCSSStyleDeclaration;
    /** @deprecated */
    xsmall?: SerializableCSSStyleDeclaration;
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
}
