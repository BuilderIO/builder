import { TARGET } from '../constants/target.js';
import { convertStyleMapToCSSArray } from '../helpers/css.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { transformBlockProperties } from './transform-block-properties.js';

const extractRelevantRootBlockProperties = (block: BuilderBlock) => {
  // currently we are only spreading the `href` property
  // TO-DO: potentially spread all properties from block, but only if they are not already defined by BuilderBlock

  // const {
  //   '@type': _type,
  //   '@version': _version,
  //   id: _id,
  //   tagName: _tagName,
  //   layerName: _layerName,
  //   groupLocked: _groupLocked,
  //   layerLocked: _layerLocked,
  //   class: _class,
  //   children: _children,
  //   responsiveStyles: _responsiveStyles,
  //   component: _component,
  //   bindings: _bindings,
  //   meta: _meta,
  //   actions: _actions,
  //   properties: _properties,
  //   code: _code,
  //   repeat: _repeat,
  //   animations: _animations,
  //   style: _style,
  //   hide: _hide,
  //   show: _show,
  //   // anything set by dynamic bindings outside of predefined `BuilderBlock` properties
  //   ...remainingBlockProperties
  // } = block;

  return { href: (block as any).href };
};

export function getBlockProperties(block: BuilderBlock) {
  const properties = {
    ...extractRelevantRootBlockProperties(block),
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
