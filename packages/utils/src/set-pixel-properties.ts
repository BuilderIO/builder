import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import traverse from 'traverse';

const isBuilderPixel = (item: unknown): item is BuilderElement => {
  return (item as any)?.id?.startsWith('builder-pixel');
};

export function setPixelProperties(
  content: BuilderContent,
  properties: Record<string, string>
): BuilderContent {
  return traverse(content).forEach(function (item) {
    if (isBuilderPixel(item)) {
      this.update({
        ...item,
        properties: {
          ...item.properties,
          ...properties,
          src: item.properties!.src,
        },
      });
    }
  });
}
