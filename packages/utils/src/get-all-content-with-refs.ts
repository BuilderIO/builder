import { BuilderContent, BuilderElement, Builder, GetContentOptions } from '@builder.io/sdk';
import traverse from 'traverse';

export const isBuilderElement = (item: unknown): item is BuilderElement => {
  return Boolean((item as any)?.['@type'] === '@builder.io/sdk:Element');
};

export async function getContentWithAllReferences(builderInstance: Builder, modelName: string, options?: GetContentOptions) {
  const promises: Promise<any>[] = [];

  const content: BuilderContent = await builderInstance.getContent(modelName, options)

  traverse(content).forEach(item => {
    if (isBuilderElement(item)) {
      
    }
  });
  await Promise.all(promises);
  return content;
}