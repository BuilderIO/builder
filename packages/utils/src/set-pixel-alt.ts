import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import traverse from 'traverse';

const isBuilderPixel = (item: unknown): item is BuilderElement => {
  return (item as any).id?.startsWith('builder-pixel');
};

export function setPixelAlt(content: BuilderContent, alt: string) {
  return traverse(content).map(function (item) {
    if (isBuilderPixel(item)) {
      this.update({
        ...item,
        properties: {
          ...item.properties,
          alt,
        },
      });
    }
  });
}
