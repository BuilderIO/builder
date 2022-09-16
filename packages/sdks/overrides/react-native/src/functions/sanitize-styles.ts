const propertiesThatMustBeNumber = new Set(['lineHeight']);
const displayValues = new Set(['flex', 'none']);

const SHOW_WARNINGS = false;

type Styles = Record<string, string | number>;

const normalizeNumber = (value: number): number | undefined => {
  if (Number.isNaN(value)) {
    return undefined;
  } else if (value < 0) {
    return 0;
  } else {
    return value;
  }
};

export const sanitizeBlockStyles = (styles: Styles): Styles => {
  return Object.keys(styles).reduce<Styles>((acc, key): Styles => {
    const propertyValue = styles[key];

    if (key === 'display' && !displayValues.has(propertyValue as string)) {
      if (SHOW_WARNINGS) {
        console.warn(
          `Style value for key "display" must be "flex" or "none" but had ${propertyValue}`
        );
      }
      return acc;
    }

    if (
      propertiesThatMustBeNumber.has(key) &&
      typeof propertyValue !== 'number'
    ) {
      if (SHOW_WARNINGS) {
        console.warn(
          `Style key ${key} must be a number, but had value \`${styles[key]}\``
        );
      }
      return acc;
    }

    // Style properties like `"20px"` need to be numbers like `20` for react native
    if (typeof propertyValue === 'string' && propertyValue.match(/^-?\d/)) {
      const newValue = parseFloat(propertyValue);
      const normalizedValue = normalizeNumber(newValue);

      if (normalizedValue) {
        const valueWithUnits = propertyValue.endsWith('%')
          ? `${normalizedValue}%`
          : '';
        return { ...acc, [key]: valueWithUnits };
      } else {
        return acc;
      }
    }

    return { ...acc, [key]: propertyValue };
  }, {});
};
