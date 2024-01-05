import { logger } from '../helpers/logger';
import type { Dictionary } from '../types/typescript';

const propertiesThatMustBeNumber = new Set(['lineHeight']);
const displayValues = new Set(['flex', 'none']);

type Styles = Record<string, string | number>;

const normalizeNumber = (value: number): number | undefined => {
  if (Number.isNaN(value)) {
    return undefined;
  } else if (value < 0) {
    // TODO: why are negative values not allowed?
    return 0;
  } else {
    return value;
  }
};

const sanitizeStringProperty = (
  key: string,
  value: string
): Dictionary<number | string> => {
  // `px` units need to be stripped and replaced with numbers
  // https://regexr.com/6ualn
  const isPixelUnit = value.match(/^-?(\d*)(\.?)(\d*)*px$/);

  if (isPixelUnit) {
    const newValue = parseFloat(value);
    const normalizedValue = normalizeNumber(newValue);
    if (normalizedValue) {
      return { [key]: normalizedValue };
    } else {
      return {};
    }
  } else if (value === '0') {
    // 0 edge case needs to be handled
    return { [key]: 0 };
  } else {
    return { [key]: value };
  }
};

export const sanitizeReactNativeBlockStyles = (styles: Styles): Styles => {
  return Object.keys(styles).reduce<Styles>((acc, key): Styles => {
    const propertyValue = styles[key];

    if (key === 'display' && !displayValues.has(propertyValue as string)) {
      logger.warn(
        `Style key "display" must be "flex" or "none", but had value: "${propertyValue}".`
      );

      return acc;
    }

    if (
      propertiesThatMustBeNumber.has(key) &&
      typeof propertyValue !== 'number'
    ) {
      logger.warn(
        `Style key "${key}" must be a number, but had value: "${styles[key]}".`
      );

      return acc;
    }

    if (typeof propertyValue === 'string') {
      return { ...acc, ...sanitizeStringProperty(key, propertyValue) };
    }

    return { ...acc, [key]: propertyValue };
  }, {});
};
