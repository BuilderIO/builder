export function transformBlock(block: any) {
  // Map the DOM-based pixel format to a native compatible one
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
