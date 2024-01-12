import type { BuilderContextInterface } from '../context/types';
import type { BuilderBlock } from '../types/builder-block';

export function transformBlockProperties<T>({
  properties,
}: {
  properties: T;
  context: BuilderContextInterface;
  block: BuilderBlock;
}) {
  return properties;
}
