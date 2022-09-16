const propertiesThatMustBeNumber = new Set(['lineHeight']);
const displayValues = new Set(['flex', 'none']);

const SHOW_WARNINGS = false;

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

    // `px` units need to be stripped and replace with numbers
    // https://regexr.com/6u5u1
    if (
      typeof propertyValue === 'string' &&
      propertyValue.match(/^-?(\d*)(\.?)(\d*)*px/)
    ) {
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
