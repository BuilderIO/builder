import type { BuilderBlock } from '../types/builder-block.js';

export function getBlockProperties(block: BuilderBlock) {
  return {
    ...block.properties,
    'builder-id': block.id,
    style: block.style,
    class: [block.id, 'builder-block', block.class, block.properties?.class]
      .filter(Boolean)
      .join(' '),
  };
}
