import { BuilderContent, Builder, GetContentOptions } from '@builder.io/sdk';
import traverse from 'traverse';

async function resolveRefs(content: any, builderInstance: Builder) {
  const promises: Promise<void>[] = [];
  const result = traverse(content).map(function (child) {
    if (child && child['@type'] === '@builder.io/core:Reference') {
      if (child.model) {
        getContentWithAllReferences(
          builderInstance,
          child.model,
          { query: { id: child.id } }
        ).then(value => (child.value = value));
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
  const content: BuilderContent = await builderInstance.get(modelName, options).toPromise();

  return await resolveRefs(content, builderInstance);
}
