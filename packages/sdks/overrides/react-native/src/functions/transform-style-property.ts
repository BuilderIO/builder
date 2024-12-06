import { getPropertyName, getStylesForProperty } from 'css-to-react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import type { Dictionary } from '../types/typescript.js';
import { extractCssVarDefaultValue } from './extract-css-var-default-value.js';

function extractVarValue(value: string): string {
  // Regular expression to find var() expressions
  const varRegex = /var\(--[^,]+?,\s*([^)]+)\)/;

  // Function to replace var() with its fallback
  let newValue = value;
  let match;
  while ((match = newValue.match(varRegex))) {
    newValue = newValue.replace(match[0], match[1].trim());
  }

  return newValue;
}
// Common regex patterns
const numberPattern = /^-?\d*\.?\d+$/;
const lengthPattern = /^-?\d*\.?\d+(px|%)?$/;
const pixelPattern = /^-?\d*\.?\d+(px)?$/;
const colorPattern =
  /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)|rgba\(\d{1,3},\s?\d{1,3},\s?\d{1,3},\s?([01]|0?\.\d+)\)|[a-zA-Z]+)$/;
const offsetPattern = /^\{width:\s?-?\d+(px)?,\s?height:\s?-?\d+(px)?\}$/;

type CSSPropertyValidator = (value: string) => boolean;

const cssProperties: Record<string, CSSPropertyValidator> = {
  // Ignore this, we add it to elements but this is the behavior already in
  // React Native and ignored by it
  boxSizing: () => true,
  // Layout Properties
  width: (value: string) =>
    lengthPattern.test(value) || ['auto', 'fit-content'].includes(value),
  height: (value: string) =>
    lengthPattern.test(value) || ['auto', 'fit-content'].includes(value),
  minWidth: (value: string) => lengthPattern.test(value) || value === 'auto',
  maxWidth: (value: string) => lengthPattern.test(value) || value === 'auto',
  minHeight: (value: string) => lengthPattern.test(value) || value === 'auto',
  maxHeight: (value: string) => lengthPattern.test(value) || value === 'auto',
  aspectRatio: (value: string) =>
    numberPattern.test(value) || /^\d+\/\d+$/.test(value),

  // Flexbox Properties
  flex: (value: string) => numberPattern.test(value),
  flexBasis: (value: string) => lengthPattern.test(value) || value === 'auto',
  flexDirection: (value: string) =>
    ['row', 'row-reverse', 'column', 'column-reverse'].includes(value),
  flexGrow: (value: string) => numberPattern.test(value),
  flexShrink: (value: string) => numberPattern.test(value),
  flexWrap: (value: string) =>
    ['wrap', 'nowrap', 'wrap-reverse'].includes(value),

  // Alignment Properties
  alignContent: (value: string) =>
    [
      'flex-start',
      'flex-end',
      'center',
      'stretch',
      'space-between',
      'space-around',
    ].includes(value),
  alignItems: (value: string) =>
    ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'].includes(value),
  alignSelf: (value: string) =>
    [
      'auto',
      'flex-start',
      'flex-end',
      'center',
      'stretch',
      'baseline',
    ].includes(value),
  justifyContent: (value: string) =>
    [
      'flex-start',
      'flex-end',
      'center',
      'space-between',
      'space-around',
      'space-evenly',
    ].includes(value),

  // Positioning Properties
  position: (value: string) => ['absolute', 'relative'].includes(value),
  top: (value: string) => lengthPattern.test(value) || value === 'auto',
  right: (value: string) => lengthPattern.test(value) || value === 'auto',
  bottom: (value: string) => lengthPattern.test(value) || value === 'auto',
  left: (value: string) => lengthPattern.test(value) || value === 'auto',
  zIndex: (value: string) => /^-?\d+$/.test(value),

  // Margin and Padding Properties
  margin: (value: string) => lengthPattern.test(value) || value === 'auto',
  marginTop: (value: string) => lengthPattern.test(value) || value === 'auto',
  marginRight: (value: string) => lengthPattern.test(value) || value === 'auto',
  marginBottom: (value: string) =>
    lengthPattern.test(value) || value === 'auto',
  marginLeft: (value: string) => lengthPattern.test(value) || value === 'auto',
  marginHorizontal: (value: string) =>
    lengthPattern.test(value) || value === 'auto',
  marginVertical: (value: string) =>
    lengthPattern.test(value) || value === 'auto',
  padding: (value: string) => lengthPattern.test(value),
  paddingTop: (value: string) => lengthPattern.test(value),
  paddingRight: (value: string) => lengthPattern.test(value),
  paddingBottom: (value: string) => lengthPattern.test(value),
  paddingLeft: (value: string) => lengthPattern.test(value),
  paddingHorizontal: (value: string) => lengthPattern.test(value),
  paddingVertical: (value: string) => lengthPattern.test(value),

  gap: (value: string) => lengthPattern.test(value),
  columnGap: (value: string) => lengthPattern.test(value),
  rowGap: (value: string) => lengthPattern.test(value),

  // Border Properties
  borderStyle: (value: string) =>
    ['solid', 'dotted', 'dashed', 'none'].includes(value),
  borderWidth: (value: string) => pixelPattern.test(value),
  borderTopWidth: (value: string) => pixelPattern.test(value),
  borderRightWidth: (value: string) => pixelPattern.test(value),
  borderBottomWidth: (value: string) => pixelPattern.test(value),
  borderLeftWidth: (value: string) => pixelPattern.test(value),
  borderColor: (value: string) => colorPattern.test(value),
  borderTopColor: (value: string) => colorPattern.test(value),
  borderRightColor: (value: string) => colorPattern.test(value),
  borderBottomColor: (value: string) => colorPattern.test(value),
  borderLeftColor: (value: string) => colorPattern.test(value),
  borderRadius: (value: string) => pixelPattern.test(value),
  borderTopLeftRadius: (value: string) => pixelPattern.test(value),
  borderTopRightRadius: (value: string) => pixelPattern.test(value),
  borderBottomLeftRadius: (value: string) => pixelPattern.test(value),
  borderBottomRightRadius: (value: string) => pixelPattern.test(value),

  // Background Properties
  backgroundColor: (value: string) => colorPattern.test(value),
  opacity: (value: string) => /^([01]|0?\.\d+)$/.test(value),

  // Text Properties
  color: (value: string) => colorPattern.test(value),
  fontFamily: () => true, // Any string is valid
  fontSize: (value: string) => pixelPattern.test(value),
  fontStyle: (value: string) => ['normal', 'italic'].includes(value),
  fontWeight: (value: string) =>
    [
      'normal',
      'bold',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ].includes(value),
  letterSpacing: (value: string) => pixelPattern.test(value),
  lineHeight: (value: string) =>
    numberPattern.test(value) || pixelPattern.test(value),
  textAlign: (value: string) =>
    ['auto', 'left', 'right', 'center', 'justify'].includes(value),
  textDecorationLine: (value: string) =>
    ['none', 'underline', 'line-through', 'underline line-through'].includes(
      value
    ),
  textDecorationStyle: (value: string) =>
    ['solid', 'double', 'dotted', 'dashed'].includes(value),
  textDecorationColor: (value: string) => colorPattern.test(value),
  textShadowColor: (value: string) => colorPattern.test(value),
  textShadowOffset: (value: string) => offsetPattern.test(value),
  textShadowRadius: (value: string) => pixelPattern.test(value),
  textTransform: (value: string) =>
    ['none', 'uppercase', 'lowercase', 'capitalize'].includes(value),

  // Other Properties
  elevation: (value: string) => /^\d+$/.test(value), // Android-specific
  resizeMode: (value: string) =>
    ['cover', 'contain', 'stretch', 'repeat', 'center'].includes(value),
  overflow: (value: string) => ['visible', 'hidden', 'scroll'].includes(value),
  display: (value: string) => ['none', 'flex'].includes(value),

  // iOS-specific Shadow Properties
  shadowColor: (value: string) => colorPattern.test(value),
  shadowOffset: (value: string) => offsetPattern.test(value),
  shadowOpacity: (value: string) => /^([01]|0?\.\d+)$/.test(value),
  shadowRadius: (value: string) => pixelPattern.test(value),

  // Android-specific Properties
  includeFontPadding: (value: string) => ['true', 'false'].includes(value),

  // Transform Properties
  transform: (value: string) => {
    const validTransforms = [
      /^translate\(\s*-?\d+(\.\d+)?(px|%)?\s*,\s*-?\d+(\.\d+)?(px|%)?\s*\)$/,
      /^scale\(\s*-?\d+(\.\d+)?\s*(,\s*-?\d+(\.\d+)?)?\s*\)$/,
      /^rotate\(\s*-?\d+(\.\d+)?deg\s*\)$/,
      /^skew\(\s*-?\d+(\.\d+)?deg\s*(,\s*-?\d+(\.\d+)?deg)?\s*\)$/,
    ];
    const transforms = value.split(/\s(?=[a-z])/).filter(Boolean);
    return transforms.every((t) =>
      validTransforms.some((regex) => regex.test(t))
    );
  },
};

function validateReactNativeCssProperty(key: string, value: string): boolean {
  const validator = cssProperties[key];
  if (!validator) {
    // Property not supported in React Native
    return false;
  }
  if (typeof value !== 'string') {
    return false;
  }
  return validator(extractVarValue(value.trim()));
}

// type CssToReactNative = typeof import('css-to-react-native')
// const cssToReactNative: typeof cssToStyleSheet = (cssToStyleSheet as any)
//   .default
//   ? (cssToStyleSheet as any).default
//   : cssToStyleSheet;

type StyleSheetProperties = ImageStyle & TextStyle & ViewStyle;

/**
 * @description List of allowed css properties.
 * We use this to filter out web CSS from Builder.io that would crash RN.
 */
const ALLOWED_CSS_PROPERTIES: Array<keyof StyleSheetProperties> = [
  // img props
  'backfaceVisibility',
  'backgroundColor',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderColor',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderWidth',
  'opacity',
  'overflow',
  'overlayColor',
  'resizeMode',
  'objectFit',
  'tintColor',
  // layout props
  'alignContent',
  'alignItems',
  'alignSelf',
  'aspectRatio',
  'borderBottomWidth',
  'borderEndWidth',
  'borderLeftWidth',
  'borderRightWidth',
  'borderStartWidth',
  'borderTopWidth',
  'borderWidth',
  'bottom',
  'columnGap',
  'direction',
  'display',
  'end',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'gap',
  'height',
  'width',
  'justifyContent',
  'left',
  'margin',
  'marginBottom',
  'marginEnd',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'overflow',
  'padding',
  'paddingBottom',
  'paddingEnd',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingTop',
  'paddingVertical',
  'position',
  'right',
  'rowGap',
  'start',
  'top',
  // shadow
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  // text props
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'includeFontPadding',
  'fontVariant',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textAlignVertical',
  'textDecorationColor',
  'textDecorationLine',
  'textDecorationStyle',
  'textShadowColor',
  'textShadowOffset',
  'textShadowRadius',
  'textTransform',
  'verticalAlign',
  'writingDirection',
  // TO-DO: type is missing until v73.2: https://github.com/facebook/react-native/issues/39015
  'userSelect' as any,
  // view style props
  'backfaceVisibility',
  'backgroundColor',
  'borderBottomColor',
  'borderBottomEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderStartEndRadius',
  'borderStartStartRadius',
  'borderEndEndRadius',
  'borderEndStartRadius',
  'borderBottomWidth',
  'borderColor',
  'borderCurve',
  'borderEndColor',
  'borderLeftColor',
  'borderLeftWidth',
  'borderRadius',
  'borderRightColor',
  'borderRightWidth',
  'borderStartColor',
  'borderStyle',
  'borderTopColor',
  'borderTopEndRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
  'borderTopWidth',
  'borderWidth',
  'elevation',
  'opacity',
  'pointerEvents',
];

const DISPLAY_VALUES = ['flex', 'none'];

const BORDERSTYLE_VALUES = ['solid', 'dotted', 'dashed'];

function omit<T extends object>(obj: T, ...values: (keyof T)[]): Partial<T> {
  const newObject = Object.assign({}, obj);
  for (const key of values) {
    delete (newObject as any)[key];
  }
  return newObject;
}

const inRange = (value: number, min: number, max: number) =>
  value >= min && value <= max;

type Styles = { [key: string]: string };

const processValue = (
  styles: Styles,
  [key, value]: [string, unknown]
): string | undefined => {
  if (typeof value !== 'string' || value === '') return undefined;
  if (!ALLOWED_CSS_PROPERTIES.includes(key as any)) return undefined;
  if (value.includes('var(')) return extractCssVarDefaultValue(value);
  if (value.includes('calc(')) return undefined;
  if (value.includes('inherit')) return undefined;
  if (value === 'px') return undefined;
  if (key === 'display' && !DISPLAY_VALUES.includes(value)) return undefined;

  if (key === 'borderStyle' && !BORDERSTYLE_VALUES.includes(value))
    return undefined;

  if (key === 'maxWidth' && value === 'none') {
    return '100%';
  }

  if (key === 'lineHeight' && !value.includes('px')) {
    const fontSize = parseFloat(styles.fontSize);
    const lineHeight = parseFloat(styles.lineHeight);

    if (!isNaN(fontSize) && !isNaN(lineHeight) && inRange(lineHeight, 1, 2)) {
      return `${Math.round(fontSize * lineHeight)}px`;
    }

    return undefined;
  }

  if (key === 'fontFamily') {
    return value.replace(/["]/g, '').split(',')[0];
  }

  const numericValue = parseFloat(value);
  const isNumeric = !isNaN(numericValue);

  if (isNumeric) {
    const processSuffix = (numAsStr: string) => {
      if (numAsStr.includes('em')) {
        if (key === 'letterSpacing') return numAsStr.replace('em', 'px');

        return numAsStr.replace('em', '');
      }

      if (numAsStr.includes('pt')) return numAsStr.replace('pt', '');
      if (numAsStr.includes('vw')) return numAsStr.replace('vw', '%');
      if (numAsStr.includes('vh')) return numAsStr.replace('vh', '%');

      return numAsStr;
    };

    return processSuffix(value);
  }

  return value;
};

/**
 * @description Cleans styles that RN can't handle and css-to-react-native doesn't fix
 */
const cleanCssStyleProps = ({
  styles,
  strictStyleMode,
}: {
  styles: Styles;
  strictStyleMode: boolean;
}): Styles =>
  Object.entries(styles).reduce((acc, [key, value]) => {
    const processedValue = processValue(styles, [key, value]);
    if (processedValue === undefined) return acc;
    if (strictStyleMode && !validateReactNativeCssProperty(key, processedValue))
      return acc;
    return { ...acc, [key]: processedValue };
  }, {});

/**
 * We ignore any `display: none` coming from med/large styles, as that would
 * inadvertedly hide our content on mobile.
 */
const removeDisplayNone = (styles: Dictionary<any>) =>
  styles.display === 'none' ? omit(styles, 'display') : styles;

function getReactNativeBlockStyles({
  block,
  context,
  blockStyles,
}: {
  block: BuilderBlock;
  context: BuilderContextInterface;
  blockStyles: any;
}): CSSStyleDeclaration | Record<string, string | undefined> {
  const responsiveStyles = block.responsiveStyles;
  if (!responsiveStyles) {
    return {};
  }

  const largeAndMediumStyles = removeDisplayNone({
    ...(responsiveStyles.large || {}),
    ...(responsiveStyles.medium || {}),
  });

  const styles = {
    // recursively apply inherited styles so that they can be passed down to children `Text` blocks
    ...context.inheritedStyles,
    ...largeAndMediumStyles,
    ...(responsiveStyles.small || {}),
    ...blockStyles,
  };

  const cleanedCSS = cleanCssStyleProps({
    styles,
    strictStyleMode: context.strictStyleMode,
  });

  /**
   * Rewrite of library's default export with per-rule error-swallowing:
   * https://github.com/styled-components/css-to-react-native/blob/837637bb134a88e8cd734b51634338fd6555068d/src/index.js#L70-L79
   */
  const newStyles = Object.entries(cleanedCSS).reduce((accum, rule) => {
    try {
      const propertyName = getPropertyName(rule[0]);
      const stylesForProp = getStylesForProperty(propertyName, rule[1], true);
      return Object.assign(accum, stylesForProp);
    } catch (error) {
      /**
       * Silently ignore any values that cause a crash in `css-to-react-native`
       * Example: this is most common when actively editing. In the process of
       * typing `15px`, the visual editor sends `15p` which throws an error.
       */
    }

    return accum;
  }, {});

  return newStyles;
}

export function transformStyleProperty({
  block,
  context,
  style,
}: {
  block: BuilderBlock;
  context: BuilderContextInterface;
  style: any;
}) {
  const newStyles = getReactNativeBlockStyles({
    block,
    context,
    blockStyles: style,
  });
  return newStyles;
}
