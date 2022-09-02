import { BuilderContent, BuilderElement, Builder } from '@builder.io/sdk';
import traverse from 'traverse';

export const isBuilderElement = (item: unknown): item is BuilderElement => {
  return Boolean((item as any)?.['@type'] === '@builder.io/sdk:Element');
};

async function resolveRefs(content: any, apiKey: string) {
  const promises: Promise<void>[] = [];
  const patches: unknown[] = [];
  const result = traverse(content).map(function (child) {
    const path = this.path.join('/');
    if (child && child['@type'] === '@builder.io/core:Reference') {
      if (child.model) {
        promises.push(
          fetch(`https://cdn.builder.io/api/v2/content/${child.model}/${child.id}?apiKey=${apiKey}`)
            .then(res => res.json())
            .then(async value => {
              child.value = await resolveRefs(value, apiKey);
              patches.push({
                op: 'replace',
                path: `/data/${path}/value`,
                value,
              });
            })
            .catch(err => {
              console.error(`Error fetching relationship ${child.id} (API key: ${apiKey}):`, err);
            })
        );
      }
    }
  });

  await Promise.all(promises);
  return { content: result, patches };
}

export async function getContentWithAllReferences(builderInstance: Builder, modelName: string) {
  const content: { results: BuilderContent[] } = await fetch(
    `https://cdn.builder.io/api/v2/content/${modelName}?apiKey=${builderInstance.apiKey}`
  ).then(res => res.json());

  return await resolveRefs(content?.results, builderInstance.apiKey!);
}
