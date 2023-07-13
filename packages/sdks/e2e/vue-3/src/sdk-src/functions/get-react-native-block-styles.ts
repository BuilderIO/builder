import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { sanitizeReactNativeBlockStyles } from './sanitize-react-native-block-styles.js';

export function getReactNativeBlockStyles({
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

  const styles = {
    // recursively apply inherited styles so that they can be passed down to children `Text` blocks
    ...context.inheritedStyles,
    ...(responsiveStyles.large || {}),
    ...(responsiveStyles.medium || {}),
    ...(responsiveStyles.small || {}),
    ...blockStyles,
  } as Record<string, string | number>;

  const newStyles = sanitizeReactNativeBlockStyles(
    styles
  ) as any as CSSStyleDeclaration;

  return newStyles;
}
