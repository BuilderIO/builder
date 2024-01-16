import { TARGET } from '../constants/target.js';
import type { BuilderContextInterface } from '../context/types.js';
import { convertStyleMapToCSSArray } from '../helpers/css.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { transformBlockProperties } from './transform-block-properties.js';

export function getBlockProperties({
  block,
  context,
}: {
  block: BuilderBlock;
  context: BuilderContextInterface;
}) {
  const properties = {
    ...block.properties,
    'builder-id': block.id,
    style: block.style ? getStyleAttribute(block.style) : undefined,
    class: [block.id, 'builder-block', block.class, block.properties?.class]
      .filter(Boolean)
      .join(' '),
  };

  return transformBlockProperties({ properties, context, block });
}
/**
 * Svelte does not support style attribute as an object so we need to flatten it.
 *
 * Additionally, Svelte, Vue and other frameworks use kebab-case styles, so we need to convert them.
 */
function getStyleAttribute(
  style: Partial<CSSStyleDeclaration>
): string | Partial<CSSStyleDeclaration> {
  switch (TARGET) {
    case 'svelte':
    case 'vue2':
    case 'vue3':
    case 'solid':
      return convertStyleMapToCSSArray(style).join(' ');
    case 'qwik':
    case 'reactNative':
    case 'react':
    case 'rsc':
      return style;
  }
}
