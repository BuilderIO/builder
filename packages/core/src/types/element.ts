type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

// TODO: typedoc this
export interface BuilderElement {
  '@type': '@builder.io/sdk:Element';
  '@version'?: number;
  id?: string;
  tagName?: string;
  layerName?: string;
  // TODO: make alias for properties.class
  class?: string;
  children?: BuilderElement[];
  responsiveStyles?: {
    large?: Partial<CSSStyleDeclaration>;
    medium?: Partial<CSSStyleDeclaration>;
    small?: Partial<CSSStyleDeclaration>;
    // DEPRECATED
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
    [key: string]: JSONValue; // JSON
  };
  actions?: {
    [key: string]: string;
  };
  properties?: {
    [key: string]: string;
  };
  repeat?: {
    collection: string;
    itemName?: string;
  } | null;
  animations?: any[]; // TODO: type the animation spec
}
