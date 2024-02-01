import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';

export function transformBlockProperties<T>({
  properties,
}: {
  properties: T;
  context: BuilderContextInterface;
  block: BuilderBlock;
}) {
  return properties;
}
