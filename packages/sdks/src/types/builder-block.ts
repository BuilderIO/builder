type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

export interface AnimationStep {
  // First one is always start state
  // isStartState?: boolean;
  styles: { [key: string]: string };
  delay?: number;
}

export interface BuilderAnimation {
  elementId: string;
  trigger: string;
  steps: AnimationStep[];
  duration: number;
  delay?: number;
  easing?: string;
  // TODO: deprecate - only here because of an API bug
  id?: string;
  // only apply in scrollInView
  repeat?: boolean;
  // only apply in scrollInView, number from -1 to 1
  thresholdPercent?: number;
}
/** @todo typedoc this */
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
    indexName?: string;
  } | null;
  animations?: BuilderAnimation[];
  style?: Partial<CSSStyleDeclaration>;
  href?: string;

  /**
   * generated by the "Hide If" binding
   */
  hide?: boolean;

  /**
   * generated by the "Show If" binding
   */
  show?: boolean;
}
