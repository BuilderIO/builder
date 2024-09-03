import type { BuilderContextInterface } from '../context/types';
import type { BuilderBlock } from '../types/builder-block';
export function transformStyleProperty({
  style
}: {
  style: Partial<CSSStyleDeclaration>;
  context: BuilderContextInterface;
  block: BuilderBlock;
}) {
  return style;
}