import { BuilderBlock } from '../types/builder-block';

export function getBlockProperties(block: BuilderBlock) {
  return {
    ...block.properties,
    'builder-id': block.id,
    class: [block.id, 'builder-block', block.class, block.properties?.class]
      .filter(Boolean)
      .join(' '),
  };
}
