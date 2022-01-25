import type { BuilderBlock } from '../types/builder-block';

export function transformBlock(block: BuilderBlock): BuilderBlock {
  // Map the DOM-based pixel format to a native compatible one.
  // react-native doesn't support DOM specific fields like `tagName` and `properties`, but any browser framework (e.g. Vue, etc.) do
  // Additionally, we only want to convert the DOM pixel format (looks like `{ tagName: 'img', properties: { src: '...' } }`)
  // but we may move to a DOM-less pixel format that uses `{ component: { name: 'Image', ... } }` so if a `component` property is provided
  // we assume this accounts for native as well and we should not transform this block
  if (block.id.startsWith('builder-pixel-') && !block.component) {
    return {
      ...block,
      component: {
        name: 'Image',
        options: {
          image: block.properties.src,
        },
      },
    };
  }
  return block;
}
