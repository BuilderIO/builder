import { getMaxWidthQueryForSize } from '../constants/device-sizes.js';
import { TARGET } from '../constants/target.js';
import { BuilderBlock } from '../types/builder-block.js';
import { convertStyleObject } from './convert-style-object.js';
import { sanitizeBlockStyles } from './sanitize-styles.js';

const getStyleForTarget = (
  styles: NonNullable<BuilderBlock['responsiveStyles']>
) => {
  switch (TARGET) {
    case 'reactNative': {
      return {
        ...(styles.large ? convertStyleObject(styles.large) : {}),
        ...(styles.medium ? convertStyleObject(styles.medium) : {}),
        ...(styles.small ? convertStyleObject(styles.small) : {}),
      };
    }
    default:
      return {
        ...(styles.large ? convertStyleObject(styles.large) : {}),

        ...(styles.medium
          ? {
              [getMaxWidthQueryForSize('medium')]: convertStyleObject(
                styles.medium
              ),
            }
          : {}),

        ...(styles.small
          ? {
              [getMaxWidthQueryForSize('small')]: convertStyleObject(
                styles.small
              ),
            }
          : {}),
      };
  }
};

export function getBlockStyles(block: BuilderBlock) {
  if (!block.responsiveStyles) {
    return {};
  }

  const styles = getStyleForTarget(block.responsiveStyles);

  const newStyles = sanitizeBlockStyles(styles);

  return newStyles;
}
