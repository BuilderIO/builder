import { sizes } from '../constants/device-sizes';
import { BuilderBlock } from '../types/builder-block';

const propertiesThatMustBeNumber = new Set(['lineHeight']);
const displayValues = new Set(['flex', 'none']);

const SHOW_WARNINGS = false;

function validateReactNativeStyles(styles: Record<string, string | number>) {
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

    if (typeof propertyValue === 'string' && propertyValue.match(/^\d/)) {
      const newValue = parseFloat(propertyValue);
      if (!isNaN(newValue)) {
        styles[key] = newValue;
      }
    }
    if (propertiesThatMustBeNumber.has(key) && typeof styles[key] !== 'number') {
      if (SHOW_WARNINGS) {
        console.warn(`Style key ${key} must be a number, but had value \`${styles[key]}\``);
      }
      delete styles[key];
    }
  }
}

export function getBlockStyles(block: BuilderBlock) {
  // TODO: responsive CSS using react native viewport width hooks
  const styles: any = {
    ...block.responsiveStyles?.large,
    ...(block as any).styles,
  };

  if (block.responsiveStyles?.medium) {
    Object.assign(styles, block.responsiveStyles.medium);
  }
  if (block.responsiveStyles?.small) {
    Object.assign(styles, block.responsiveStyles.small);
  }

  validateReactNativeStyles(styles);

  return styles;
}
