import { getMaxWidthQueryForSize } from '../constants/device-sizes.js';
import { TARGET } from '../constants/target.js';
import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { convertStyleObject } from './convert-style-object.js';
import { sanitizeBlockStyles } from './sanitize-styles.js';

const getStyleForTarget = ({
  styles,
  context,
}: {
  styles: NonNullable<BuilderBlock['responsiveStyles']>;
  context: BuilderContextInterface;
}) => {
  switch (TARGET) {
    case 'reactNative': {
      return {
        ...context.inheritedStyles,
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

export function getBlockStyles({
  block,
  context,
}: {
  block: BuilderBlock;
  context: BuilderContextInterface;
}) {
  if (!block.responsiveStyles) {
    return {};
  }

  const styles = getStyleForTarget({ styles: block.responsiveStyles, context });

  const newStyles = sanitizeBlockStyles(styles);

  return newStyles;
}
