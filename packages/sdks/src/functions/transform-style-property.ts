import type { BuilderContextInterface } from '../context/types';
import type { BuilderBlock } from '../types/builder-block';

export function transformStyleProperty<T>({
  style,
}: {
  style: T;
  context: BuilderContextInterface;
  block: BuilderBlock;
}) {
  return style;
}
