import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { getStyle } from './get-style.js';
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

export function getBlockProperties({
  block,
  context,
  includeStyles,
}: {
  block: BuilderBlock;
  context: BuilderContextInterface;
  includeStyles: boolean;
}) {
  const properties: any = {
    ...extractRelevantRootBlockProperties(block),
    ...block.properties,
    'builder-id': block.id,
    class: [block.id, 'builder-block', block.class, block.properties?.class]
      .filter(Boolean)
      .join(' '),
  };

  if (includeStyles) {
    properties.style = getStyle({ block, context });
  }

  return transformBlockProperties({ properties, context, block });
}
