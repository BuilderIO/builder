import { BuilderBlock } from '../types/builder-block';

export function getBlockProperties(block: BuilderBlock) {
  // TODO: bindings
  return {
    ...block.properties,
    'builder-id': block.id,
    class: [block.id, 'builder-block', block.class].filter(Boolean).join(' '),
  };
}
