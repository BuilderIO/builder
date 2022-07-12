const propertiesThatMustBeNumber = new Set(['lineHeight']);
const displayValues = new Set(['flex', 'none']);

const SHOW_WARNINGS = false;

export const sanitizeBlockStyles = (
  styles: Record<string, string | number>
) => {
  // Style properties like `"20px"` need to be numbers like `20` for react native
  for (const key in styles) {
    const propertyValue = styles[key];

    if (key === 'display' && !displayValues.has(propertyValue as string)) {
      if (SHOW_WARNINGS) {
        console.warn(
          `Style value for key "display" must be "flex" or "none" but had ${propertyValue}`
        );
      }
      delete styles[key];
    }

    if (typeof propertyValue === 'string' && propertyValue.match(/^-?\d/)) {
      const newValue = parseFloat(propertyValue);
      if (!isNaN(newValue)) {
        styles[key] = newValue;
      }

      if (typeof newValue === 'number' && newValue < 0) {
        styles[key] = 0;
      }
    }
    if (
      propertiesThatMustBeNumber.has(key) &&
      typeof styles[key] !== 'number'
    ) {
      if (SHOW_WARNINGS) {
        console.warn(
          `Style key ${key} must be a number, but had value \`${styles[key]}\``
        );
      }
      delete styles[key];
    }
  }
};
