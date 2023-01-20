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

export function transformBlockProperties(block: BuilderBlock) {
  block.class = classStringToObject(block.class);
  return block;
}
