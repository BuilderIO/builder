type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

/** @todo typedoc this */
export interface BuilderElement {
  '@type': '@builder.io/sdk:Element';
  '@version'?: number;
  id?: string;
  tagName?: string;
  layerName?: string;
  groupLocked?: boolean;
  layerLocked?: boolean;
  /** @todo make alias for properties.class */
  class?: string;
  children?: BuilderElement[];
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
  animations?: Animation[]; // TODO: type the animation spec
}

interface Animation {}
