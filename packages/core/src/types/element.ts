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
    /**
     * el.component.options is a key-value record where the values are static, literal expressions.
     * These may be set as a result of el.bindings being evaluated.
     * These get passed as props to the underlying component, such as a React component.
     * 
     * el.component.options["bar"] = "abc" --> <CustomReactComponent bar={"abc"} ...>
     */
    options?: any;
    tag?: string;
  };

  /**
   * el.bindings is a key-value record where the values can be dynamic JS expressions. 
   * These may be set as a result of el.code.bindings being edited and then transpiled.
   * After the expressions are evaluated, the key and result value get bound elsewhere 
   * according to this pattern:
   * 
   * el.bindings["foo"] will be bound to el.properties["foo"]
   * el.bindings["component.options.bar"] will be bound to el.component.options["bar"]
   */
  bindings?: {
    [key: string]: string;
  };
  meta?: {
    [key: string]: JSONValue;
  };
  actions?: {
    [key: string]: string;
  };

  /**
   * el.properties is a key-value record where the values are static, literal expressions.
   * These may be set as a result of el.bindings being evaluated.
   * These get applied as attributes on the top-level HTML element inside this Element.
   * 
   * el.properties["foo"] = "1" --> <htmlnode foo="1" ...>
   */
  properties?: {
    [key: string]: string;
  };
  code?: {
    /**
     * el.code.bindings is a key-value record where the values represent user-authored code 
     * written in Builder's Data view. The values can be literal or dynamic expressions, 
     * can use Types, and can even add complex logic like async/await. These values get transpiled 
     * and the results override the matching key-value pair in el.bindings.
     */
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
