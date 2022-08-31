import { BuilderContent, BuilderElement, Builder, GetContentOptions, BehaviorSubject } from '@builder.io/sdk';
import traverse from 'traverse';

export const isBuilderElement = (item: unknown): item is BuilderElement => {
  return Boolean((item as any)?.['@type'] === '@builder.io/sdk:Element');
};

async function resolveRefs(content: any, apiKey: string) {
  const promises: Promise<void>[] = [];
  const patches: IJsonPatch[] = [];
  const result = traverse(content).map(function (child) {
    const path = this.path.join('/');
    if (child && child['@type'] === '@builder.io/core:Reference') {
      if (child.model) {
        promises.push(
          fetch(
            `https://cdn.builder.io/api/v2/content/${child.model}/${child.id}?apiKey=${apiKey}`
          )
            .then(res => res.json())
            .then(value => {
              child.value = resolveRefs(value, apiKey);
              patches.push({
                op: 'replace',
                path: `/data/${path}/value`,
                value,
              });
            })
            .catch(err => {
              console.error(
                `Error fetching relationship ${child.id} (API key: ${apiKey}):`,
                err
              );
            })
        );
      }
    }

    if (child && child['@type'] === '@builder.io/core:Request') {
      promises.push(
        fetch(child.request.url, { headers: child.request.headers || {} })
          .then(res => res.json())
          .then(value => {
            child.data = value;
            patches.push({
              op: 'replace',
              path: `/data/${path}/data`,
              value,
            });
          })
      );
    }
  });

  await Promise.all(promises);
  return { fullContent: result, patches };
}



export async function getContentWithAllReferences(builderInstance: Builder, modelName: string, options?: GetContentOptions) {

  const content: BehaviorSubject<BuilderContent[], any> = await builderInstance.getContent(modelName, options)
  
  return await resolveRefs(content, builderInstance.apiKey!)
}