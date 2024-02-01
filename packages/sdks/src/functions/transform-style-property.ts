import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';

export function transformStyleProperty({
  style,
}: {
  style: Partial<CSSStyleDeclaration>;
  context: BuilderContextInterface;
  block: BuilderBlock;
}) {
  return style;
}
