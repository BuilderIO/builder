import type { BuilderBlock } from '../types/builder-block';

export function transformBlock(block: BuilderBlock): BuilderBlock {
  // Map the DOM-based pixel format to a native compatible one.
  // react-native doesn't support DOM specific fields like `tagName` and `properties`, but any browser framework (e.g. Vue, etc.) do
  if (block.id.startsWith('builder-pixel-')) {
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
