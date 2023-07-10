import type { BuilderBlock } from '../types/builder-block.js';

export function transformBlockProperties(properties: BuilderBlock) {
  properties.className = properties.class;
  delete properties.class;
  return properties;
}
