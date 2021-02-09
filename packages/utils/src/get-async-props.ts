import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import traverse from 'traverse';

export const isBuilderElement = (item: unknown): item is BuilderElement => {
  return Boolean((item as any)?.['@type'] === '@builder.io/sdk:Element');
};

type PropsMappers = { [key: string]: (props: any, block: BuilderElement) => Promise<any> };

export async function getAsyncProps(content: BuilderContent, mappers: PropsMappers) {
  const promises: Promise<any>[] = [];
  traverse(content).forEach(item => {
    if (isBuilderElement(item)) {
      if (item.component) {
        const mapper = mappers[item.component.name];
        if (mapper) {
          promises.push(
            mapper(item.component!.options, item).then(result => {
              Object.assign(item.component!.options, result);
            })
          );
        }
      }
    }
  });
  await Promise.all(promises);
  return content;
}
