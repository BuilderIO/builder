import { logger } from '../helpers/logger';

const propertiesThatMustBeNumber = new Set(['lineHeight']);
const displayValues = new Set(['flex', 'none']);

type Styles = Record<string, string | number>;

const normalizeNumber = (value: number): number | undefined => {
  if (Number.isNaN(value)) return undefined;

  return value;
};

const sanitizeStringProperty = (value: string): number | string | undefined => {
  // `px` units need to be stripped and replaced with numbers
  // https://regexr.com/6ualn
  const isPixelUnit = value.match(/^-?(\d*)(\.?)(\d*)*px$/);

  const parsedValue = normalizeNumber(parseFloat(value));

  // case where property is not a number, so we return the original string.
  if (!parsedValue) return value;

  // pixel values must be non-negative (find out why!)
  if (isPixelUnit) return parsedValue < 0 ? 0 : parsedValue;

  // otherwise, return the parsed value
  return parsedValue;
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

    if (key === 'margin' || key === 'padding') {
      const values = propertyValue
        .toString()
        .split(' ')
        .map(sanitizeStringProperty)
        .filter((x): x is string | number => {
          if (x === undefined) {
            logger.warn(
              `Style key "${key}" had an invalid value: "${x}" within "${propertyValue}".`
            );
          }

          return x !== undefined;
        });

      if (values.length === 1) {
        return {
          ...acc,
          [`${key}Top`]: values[0],
          [`${key}Right`]: values[0],
          [`${key}Bottom`]: values[0],
          [`${key}Left`]: values[0],
        };
      } else if (values.length === 2) {
        return {
          ...acc,
          [`${key}Top`]: values[0],
          [`${key}Right`]: values[1],
          [`${key}Bottom`]: values[0],
          [`${key}Left`]: values[1],
        };
      } else if (values.length === 3) {
        return {
          ...acc,
          [`${key}Top`]: values[0],
          [`${key}Right`]: values[1],
          [`${key}Bottom`]: values[2],
          [`${key}Left`]: values[1],
        };
      } else if (values.length === 4) {
        return {
          ...acc,
          [`${key}Top`]: values[0],
          [`${key}Right`]: values[1],
          [`${key}Bottom`]: values[2],
          [`${key}Left`]: values[3],
        };
      } else {
        logger.warn(
          `Style key "${key}" must have 1-4 values, but had value: "${styles[key]}".`
        );

        return acc;
      }
    }

    if (typeof propertyValue === 'string') {
      const sanitizedVal = sanitizeStringProperty(propertyValue);
      if (sanitizedVal === undefined) {
        logger.warn(
          `Style key "${key}" had an invalid value: "${propertyValue}".`
        );

        return acc;
      }

      return { ...acc, [key]: sanitizedVal };
    }

    return { ...acc, [key]: propertyValue };
  }, {});
};
