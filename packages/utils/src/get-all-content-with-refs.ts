import { BuilderContent, BuilderElement, Builder, GetContentOptions } from '@builder.io/sdk';
import traverse from 'traverse';

export const isBuilderElement = (item: unknown): item is BuilderElement => {
  return Boolean((item as any)?.['@type'] === '@builder.io/sdk:Element');
};

async function resolveRefs(content: any, builderInstance: Builder, options?: GetContentOptions) {
  const promises: Promise<void>[] = [];
  const result = traverse(content).map(function (child) {
    if (child && child['@type'] === '@builder.io/core:Reference') {
      if (child.model) {
        promises.push(
          builderInstance
            .getAll(child.model, { options: options || { query: { id: child.id } } })
            .then(async value => {
              child.value = await resolveRefs(value, builderInstance);
            })
        );
      }
    }
  });

  await Promise.all(promises);
  return result;
}

export async function getContentWithAllReferences(
  builderInstance: Builder,
  modelName: string,
  options: GetContentOptions
) {
  const content: BuilderContent[] = await builderInstance.getAll(modelName, options);

  return await resolveRefs(content, builderInstance, options);
}
