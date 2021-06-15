import { BuilderContent } from '@builder.io/sdk';
import traverse from 'traverse';
type PropsMappers = { [key: string]: (props: any) => Promise<any> };

export async function extendAsyncProps(content: BuilderContent, mappers: PropsMappers) {
  const promises: Promise<any>[] = [];
  traverse(content).forEach(function (field) {
    const isComponentOptions = ['component.options', 'symbol.data'].includes(
      this.path.slice(-2).join('.')
    );
    if (field && isComponentOptions) {
      const keys = Object.keys(field);
      keys.forEach(key => {
        const mapper = mappers[key];
        if (mapper) {
          promises.push(
            mapper(field).then(result => {
              this.update({
                ...field,
                ...result,
              });
            })
          );
        }
      });
    }
  });
  await Promise.all(promises);
  return content;
}
