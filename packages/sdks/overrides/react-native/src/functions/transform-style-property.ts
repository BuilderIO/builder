import cssToStyleSheet from 'css-to-react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import type { Dictionary } from '../types/typescript.js';

const cssToReactNative: typeof cssToStyleSheet = (cssToStyleSheet as any)
  .default
  ? (cssToStyleSheet as any).default
  : cssToStyleSheet;

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

const processValue = (
  styles: { [key: string]: string },
  [key, value]: [string, unknown]
): string | undefined => {
  if (typeof value !== 'string' || value === '') return undefined;
  if (!ALLOWED_CSS_PROPERTIES.includes(key as any)) return undefined;
  if (value.includes('calc')) return undefined;
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
const cleanCssStyleProps = (styles: {
  [key: string]: string;
}): { [key: string]: string } =>
  Object.entries(styles).reduce((acc, [key, value]) => {
    const processedValue = processValue(styles, [key, value]);
    if (processedValue === undefined) return acc;
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
  } as Record<string, string | number>;

  const cleanedCSS = cleanCssStyleProps(styles as any);

  const newStyles = cssToReactNative(
    Object.entries(cleanedCSS)
  ) as any as CSSStyleDeclaration;

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
