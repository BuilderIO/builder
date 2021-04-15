type JSON = string | number | boolean | null | { [key: string]: JSON } | JSON[];

// TODO: separate full and partial versions
export interface BuilderContent extends BuilderContentVariation {
  // TODO: query
  "@version"?: number;
  id?: string;
  name?: string;
  published?: "published" | "draft" | "archived";
  modelId?: string;
  priority?: number;
  lastUpdated?: number;
  startDate?: number;
  endDate?: number;
  variations?: {
    [id: string]: BuilderContentVariation | undefined;
  };
}

export interface BuilderContentVariation {
  data?: {
    blocks?: BuilderElement[];
    inputs?: Input[];
    state?: { [key: string]: any };
    [key: string]: any;
  };
  name?: string;
  testRatio?: number;
  id?: string;
}

export interface BuilderElement {
  "@type": "@builder.io/sdk:Element";
  "@version"?: number;
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
    [key: string]: JSON;
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

export interface Input {
  /**
   * Name of attribute that will be passed in props to the component.
   */
  name: string;
  /**
   * Name that is displayed in the visual editor.
   */
  friendlyName?: string;
  /**
   * ???
   */
  description?: string;
  defaultValue?: any;
  type: string;
  required?: boolean;
  autoFocus?: boolean;
  subFields?: Input[];
  /**
   * Tool-tip text that is displayed next to the input field in the CMS.
   */
  helperText?: string;
  allowedFileTypes?: string[];
  imageHeight?: number;
  imageWidth?: number;
  mediaHeight?: number;
  mediaWidth?: number;
  /**
   * Don't display in the option tab.
   */
  hideFromUI?: boolean;
  modelId?: string;
  options?: { [key: string]: any };
  enum?: string[] | { label: string; value: any; helperText?: string }[];
  /** Regex field validation for all string types (text, longText, html, url, etc) */
  regex?: {
    /** pattern to test, like "^\/[a-z]$" */
    pattern: string;
    /** flags for the RegExp constructor, e.g. "gi"  */
    options?: string;
    /**
     * Friendly message to display to end-users if the regex fails, e.g.
     * "You must use a relative url starting with '/...' "
     */
    message: string;
  };
  advanced?: boolean;
  onChange?: Function | string;
  code?: boolean;
  richText?: boolean;
  showIf?: ((options: Map<string, any>) => boolean) | string;
  copyOnAdd?: boolean;
}

interface CSSStyleDeclaration {
  alignContent: string;
  alignItems: string;
  alignSelf: string;
  alignmentBaseline: string;
  all: string;
  animation: string;
  animationDelay: string;
  animationDirection: string;
  animationDuration: string;
  animationFillMode: string;
  animationIterationCount: string;
  animationName: string;
  animationPlayState: string;
  animationTimingFunction: string;
  backfaceVisibility: string;
  background: string;
  backgroundAttachment: string;
  backgroundClip: string;
  backgroundColor: string;
  backgroundImage: string;
  backgroundOrigin: string;
  backgroundPosition: string;
  backgroundPositionX: string;
  backgroundPositionY: string;
  backgroundRepeat: string;
  backgroundSize: string;
  baselineShift: string;
  blockSize: string;
  border: string;
  borderBlockEnd: string;
  borderBlockEndColor: string;
  borderBlockEndStyle: string;
  borderBlockEndWidth: string;
  borderBlockStart: string;
  borderBlockStartColor: string;
  borderBlockStartStyle: string;
  borderBlockStartWidth: string;
  borderBottom: string;
  borderBottomColor: string;
  borderBottomLeftRadius: string;
  borderBottomRightRadius: string;
  borderBottomStyle: string;
  borderBottomWidth: string;
  borderCollapse: string;
  borderColor: string;
  borderImage: string;
  borderImageOutset: string;
  borderImageRepeat: string;
  borderImageSlice: string;
  borderImageSource: string;
  borderImageWidth: string;
  borderInlineEnd: string;
  borderInlineEndColor: string;
  borderInlineEndStyle: string;
  borderInlineEndWidth: string;
  borderInlineStart: string;
  borderInlineStartColor: string;
  borderInlineStartStyle: string;
  borderInlineStartWidth: string;
  borderLeft: string;
  borderLeftColor: string;
  borderLeftStyle: string;
  borderLeftWidth: string;
  borderRadius: string;
  borderRight: string;
  borderRightColor: string;
  borderRightStyle: string;
  borderRightWidth: string;
  borderSpacing: string;
  borderStyle: string;
  borderTop: string;
  borderTopColor: string;
  borderTopLeftRadius: string;
  borderTopRightRadius: string;
  borderTopStyle: string;
  borderTopWidth: string;
  borderWidth: string;
  bottom: string;
  boxShadow: string;
  boxSizing: string;
  breakAfter: string;
  breakBefore: string;
  breakInside: string;
  captionSide: string;
  caretColor: string;
  clear: string;
  clip: string;
  clipPath: string;
  clipRule: string;
  color: string;
  colorInterpolation: string;
  colorInterpolationFilters: string;
  columnCount: string;
  columnFill: string;
  columnGap: string;
  columnRule: string;
  columnRuleColor: string;
  columnRuleStyle: string;
  columnRuleWidth: string;
  columnSpan: string;
  columnWidth: string;
  columns: string;
  content: string;
  counterIncrement: string;
  counterReset: string;
  cssFloat: string;
  cssText: string;
  cursor: string;
  direction: string;
  display: string;
  dominantBaseline: string;
  emptyCells: string;
  fill: string;
  fillOpacity: string;
  fillRule: string;
  filter: string;
  flex: string;
  flexBasis: string;
  flexDirection: string;
  flexFlow: string;
  flexGrow: string;
  flexShrink: string;
  flexWrap: string;
  float: string;
  floodColor: string;
  floodOpacity: string;
  font: string;
  fontFamily: string;
  fontFeatureSettings: string;
  fontKerning: string;
  fontSize: string;
  fontSizeAdjust: string;
  fontStretch: string;
  fontStyle: string;
  fontSynthesis: string;
  fontVariant: string;
  fontVariantCaps: string;
  fontVariantEastAsian: string;
  fontVariantLigatures: string;
  fontVariantNumeric: string;
  fontVariantPosition: string;
  fontWeight: string;
  gap: string;
  glyphOrientationVertical: string;
  grid: string;
  gridArea: string;
  gridAutoColumns: string;
  gridAutoFlow: string;
  gridAutoRows: string;
  gridColumn: string;
  gridColumnEnd: string;
  gridColumnGap: string;
  gridColumnStart: string;
  gridGap: string;
  gridRow: string;
  gridRowEnd: string;
  gridRowGap: string;
  gridRowStart: string;
  gridTemplate: string;
  gridTemplateAreas: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  height: string;
  hyphens: string;
  imageOrientation: string;
  imageRendering: string;
  inlineSize: string;
  justifyContent: string;
  justifyItems: string;
  justifySelf: string;
  left: string;
  readonly length: number;
  letterSpacing: string;
  lightingColor: string;
  lineBreak: string;
  lineHeight: string;
  listStyle: string;
  listStyleImage: string;
  listStylePosition: string;
  listStyleType: string;
  margin: string;
  marginBlockEnd: string;
  marginBlockStart: string;
  marginBottom: string;
  marginInlineEnd: string;
  marginInlineStart: string;
  marginLeft: string;
  marginRight: string;
  marginTop: string;
  marker: string;
  markerEnd: string;
  markerMid: string;
  markerStart: string;
  mask: string;
  maskComposite: string;
  maskImage: string;
  maskPosition: string;
  maskRepeat: string;
  maskSize: string;
  maskType: string;
  maxBlockSize: string;
  maxHeight: string;
  maxInlineSize: string;
  maxWidth: string;
  minBlockSize: string;
  minHeight: string;
  minInlineSize: string;
  minWidth: string;
  objectFit: string;
  objectPosition: string;
  opacity: string;
  order: string;
  orphans: string;
  outline: string;
  outlineColor: string;
  outlineOffset: string;
  outlineStyle: string;
  outlineWidth: string;
  overflow: string;
  overflowAnchor: string;
  overflowWrap: string;
  overflowX: string;
  overflowY: string;
  overscrollBehavior: string;
  overscrollBehaviorBlock: string;
  overscrollBehaviorInline: string;
  overscrollBehaviorX: string;
  overscrollBehaviorY: string;
  padding: string;
  paddingBlockEnd: string;
  paddingBlockStart: string;
  paddingBottom: string;
  paddingInlineEnd: string;
  paddingInlineStart: string;
  paddingLeft: string;
  paddingRight: string;
  paddingTop: string;
  pageBreakAfter: string;
  pageBreakBefore: string;
  pageBreakInside: string;
  paintOrder: string;
  readonly parentRule: CSSRule | null;
  perspective: string;
  perspectiveOrigin: string;
  placeContent: string;
  placeItems: string;
  placeSelf: string;
  pointerEvents: string;
  position: string;
  quotes: string;
  resize: string;
  right: string;
  rotate: string;
  rowGap: string;
  rubyAlign: string;
  rubyPosition: string;
  scale: string;
  scrollBehavior: string;
  shapeRendering: string;
  stopColor: string;
  stopOpacity: string;
  stroke: string;
  strokeDasharray: string;
  strokeDashoffset: string;
  strokeLinecap: string;
  strokeLinejoin: string;
  strokeMiterlimit: string;
  strokeOpacity: string;
  strokeWidth: string;
  tabSize: string;
  tableLayout: string;
  textAlign: string;
  textAlignLast: string;
  textAnchor: string;
  textCombineUpright: string;
  textDecoration: string;
  textDecorationColor: string;
  textDecorationLine: string;
  textDecorationStyle: string;
  textEmphasis: string;
  textEmphasisColor: string;
  textEmphasisPosition: string;
  textEmphasisStyle: string;
  textIndent: string;
  textJustify: string;
  textOrientation: string;
  textOverflow: string;
  textRendering: string;
  textShadow: string;
  textTransform: string;
  textUnderlinePosition: string;
  top: string;
  touchAction: string;
  transform: string;
  transformBox: string;
  transformOrigin: string;
  transformStyle: string;
  transition: string;
  transitionDelay: string;
  transitionDuration: string;
  transitionProperty: string;
  transitionTimingFunction: string;
  translate: string;
  unicodeBidi: string;
  userSelect: string;
  verticalAlign: string;
  visibility: string;
  /** @deprecated */
  webkitAlignContent: string;
  /** @deprecated */
  webkitAlignItems: string;
  /** @deprecated */
  webkitAlignSelf: string;
  /** @deprecated */
  webkitAnimation: string;
  /** @deprecated */
  webkitAnimationDelay: string;
  /** @deprecated */
  webkitAnimationDirection: string;
  /** @deprecated */
  webkitAnimationDuration: string;
  /** @deprecated */
  webkitAnimationFillMode: string;
  /** @deprecated */
  webkitAnimationIterationCount: string;
  /** @deprecated */
  webkitAnimationName: string;
  /** @deprecated */
  webkitAnimationPlayState: string;
  /** @deprecated */
  webkitAnimationTimingFunction: string;
  /** @deprecated */
  webkitAppearance: string;
  /** @deprecated */
  webkitBackfaceVisibility: string;
  /** @deprecated */
  webkitBackgroundClip: string;
  /** @deprecated */
  webkitBackgroundOrigin: string;
  /** @deprecated */
  webkitBackgroundSize: string;
  /** @deprecated */
  webkitBorderBottomLeftRadius: string;
  /** @deprecated */
  webkitBorderBottomRightRadius: string;
  /** @deprecated */
  webkitBorderRadius: string;
  /** @deprecated */
  webkitBorderTopLeftRadius: string;
  /** @deprecated */
  webkitBorderTopRightRadius: string;
  /** @deprecated */
  webkitBoxAlign: string;
  /** @deprecated */
  webkitBoxFlex: string;
  /** @deprecated */
  webkitBoxOrdinalGroup: string;
  /** @deprecated */
  webkitBoxOrient: string;
  /** @deprecated */
  webkitBoxPack: string;
  /** @deprecated */
  webkitBoxShadow: string;
  /** @deprecated */
  webkitBoxSizing: string;
  /** @deprecated */
  webkitFilter: string;
  /** @deprecated */
  webkitFlex: string;
  /** @deprecated */
  webkitFlexBasis: string;
  /** @deprecated */
  webkitFlexDirection: string;
  /** @deprecated */
  webkitFlexFlow: string;
  /** @deprecated */
  webkitFlexGrow: string;
  /** @deprecated */
  webkitFlexShrink: string;
  /** @deprecated */
  webkitFlexWrap: string;
  /** @deprecated */
  webkitJustifyContent: string;
  webkitLineClamp: string;
  /** @deprecated */
  webkitMask: string;
  /** @deprecated */
  webkitMaskBoxImage: string;
  /** @deprecated */
  webkitMaskBoxImageOutset: string;
  /** @deprecated */
  webkitMaskBoxImageRepeat: string;
  /** @deprecated */
  webkitMaskBoxImageSlice: string;
  /** @deprecated */
  webkitMaskBoxImageSource: string;
  /** @deprecated */
  webkitMaskBoxImageWidth: string;
  /** @deprecated */
  webkitMaskClip: string;
  /** @deprecated */
  webkitMaskComposite: string;
  /** @deprecated */
  webkitMaskImage: string;
  /** @deprecated */
  webkitMaskOrigin: string;
  /** @deprecated */
  webkitMaskPosition: string;
  /** @deprecated */
  webkitMaskRepeat: string;
  /** @deprecated */
  webkitMaskSize: string;
  /** @deprecated */
  webkitOrder: string;
  /** @deprecated */
  webkitPerspective: string;
  /** @deprecated */
  webkitPerspectiveOrigin: string;
  webkitTapHighlightColor: string;
  /** @deprecated */
  webkitTextFillColor: string;
  /** @deprecated */
  webkitTextSizeAdjust: string;
  /** @deprecated */
  webkitTextStroke: string;
  /** @deprecated */
  webkitTextStrokeColor: string;
  /** @deprecated */
  webkitTextStrokeWidth: string;
  /** @deprecated */
  webkitTransform: string;
  /** @deprecated */
  webkitTransformOrigin: string;
  /** @deprecated */
  webkitTransformStyle: string;
  /** @deprecated */
  webkitTransition: string;
  /** @deprecated */
  webkitTransitionDelay: string;
  /** @deprecated */
  webkitTransitionDuration: string;
  /** @deprecated */
  webkitTransitionProperty: string;
  /** @deprecated */
  webkitTransitionTimingFunction: string;
  /** @deprecated */
  webkitUserSelect: string;
  whiteSpace: string;
  widows: string;
  width: string;
  willChange: string;
  wordBreak: string;
  wordSpacing: string;
  wordWrap: string;
  writingMode: string;
  zIndex: string;
  /** @deprecated */
  zoom: string;
  getPropertyPriority(property: string): string;
  getPropertyValue(property: string): string;
  item(index: number): string;
  removeProperty(property: string): string;
  setProperty(property: string, value: string | null, priority?: string): void;
  // Had to comment this out to get typescript-json-schema to work
  // [index: number]: string;
}
