import type { BuilderBlock } from '../types/builder-block.js';

function classStringToObject(str: string) {
  const obj = {};
  if (typeof str !== 'string') {
    return obj;
  }
  const classNames = str.trim().split(/\\s+/);
  for (const name of classNames) {
    obj[name] = true;
  }
  return obj;
}

// TODO: way to import the original and then modify
export function getBlockProperties(block: BuilderBlock) {
  return {
    ...block.properties,
    'builder-id': block.id,
    class: classStringToObject(
      [block.id, 'builder-block', block.class, block.properties?.class]
        .filter(Boolean)
        .join(' ')
    ),
  };
}
