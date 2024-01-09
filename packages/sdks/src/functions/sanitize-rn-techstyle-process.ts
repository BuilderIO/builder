import cssToStyleSheet from 'css-to-react-native';
import { ALLOWED_CSS_PROPERTIES } from './sanitize-rn-allowed-css';

const DISPLAY_VALUES = ['flex', 'none'];
type Styles = Record<string, string | number>;

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
  [key, value]: [string, string]
): string | undefined => {
  if (!ALLOWED_CSS_PROPERTIES.includes(key as any)) return undefined;
  if (value.includes('calc')) return undefined;
  if (value.includes('inherit')) return undefined;
  if (value === 'px') return undefined;
  if (key === 'display' && !DISPLAY_VALUES.includes(value)) return undefined;

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
    const processSuffix = (numericVal: string) => {
      if (numericVal.includes('em')) {
        if (key === 'letterSpacing') return numericVal.replace('em', 'px');

        return numericVal.replace('em', '');
      }

      if (numericVal.includes('pt')) return numericVal.replace('pt', '');
      if (numericVal.includes('vw')) return numericVal.replace('vw', '%');
      if (numericVal.includes('vh')) return numericVal.replace('vh', '%');

      return numericVal;
    };

    return processSuffix(value);
  }

  return value;
};

/**
 * @description Cleans styles that RN can't handle and css-to-react-native doesn't fix
 */
export const cleanCssStyleProps = (styles: {
  [key: string]: string;
}): { [key: string]: string } =>
  Object.entries(styles).reduce((acc, [key, value]) => {
    const processedValue = processValue(styles, [key, value]);
    if (processedValue === undefined) return acc;
    return { ...acc, [key]: processedValue };
  }, {});

const removeDisplayNone = (styles: { [key: string]: string }) =>
  styles.display === 'none' ? omit(styles, 'display') : styles;

/**
 * @description Transforms Builder responsiveStyles object to React Native StyleSheet
 */
export const responsiveStylesToStyleSheet = (responsiveStyles?: Styles) => {
  const large = responsiveStyles?.large || {};
  const medium = responsiveStyles?.medium || {};
  const small = responsiveStyles?.small || {};

  const filtered = removeDisplayNone({ ...large, ...medium });

  const css = { ...filtered, ...small };
  const cleanedCss = cleanCssStyleProps(css);

  return cssToStyleSheet(Object.entries(cleanedCss));
};
