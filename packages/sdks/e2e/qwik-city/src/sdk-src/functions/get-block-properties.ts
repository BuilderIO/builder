import { TARGET } from '../constants/target.js';
import { convertStyleMapToCSSArray } from '../helpers/css.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { transformBlockProperties } from './transform-block-properties.js';

export function getBlockProperties(block: BuilderBlock) {
  const properties = {
    ...block.properties,
    'builder-id': block.id,
    style: getStyleAttribute(block.style),
    class: [block.id, 'builder-block', block.class, block.properties?.class]
      .filter(Boolean)
      .join(' '),
  };

  return transformBlockProperties(properties);
}
/**
 * Svelte does not support style attribute as an object so we need to flatten it.
 *
 * Additionally, Svelte, Vue and other frameworks use kebab-case styles, so we need to convert them.
 */
function getStyleAttribute(
  style: Partial<CSSStyleDeclaration> | undefined
): string | Partial<CSSStyleDeclaration> | undefined {
  if (!style) {
    return undefined;
  }

  switch (TARGET) {
    case 'svelte':
    case 'vue2':
    case 'vue3':
    case 'solid':
      return convertStyleMapToCSSArray(style).join(' ');
    case 'qwik':
    case 'reactNative':
    case 'react':
      return style;
  }
}
