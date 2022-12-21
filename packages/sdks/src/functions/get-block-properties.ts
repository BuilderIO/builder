import { TARGET } from '../constants/target.js';
import type { BuilderBlock } from '../types/builder-block.js';

export function getBlockProperties(block: BuilderBlock) {
  return {
    ...block.properties,
    'builder-id': block.id,
    style: TARGET === 'svelte' ? toStyleAttribute(block.style) : block.style,
    class: [block.id, 'builder-block', block.class, block.properties?.class]
      .filter(Boolean)
      .join(' '),
  };
}
/**
 * Svelte does not support style attribute as an object so we need to flatten it.
 */
function toStyleAttribute(
  style: Partial<CSSStyleDeclaration> | undefined
): string | undefined {
  if (!style) return style;
  let styleValue = '';
  Object.keys(style).forEach((key) => {
    styleValue += `${key}: ${(style as any)[key]};`;
  });
  return styleValue;
}
