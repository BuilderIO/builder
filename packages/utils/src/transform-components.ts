import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import traverse from 'traverse';

const isBuilderElement = (item: unknown): item is BuilderElement => {
  return Boolean((item as any)?.['@type'] === '@builder.io/sdk:Element');
};

type PropsMappers = { [key: string]: { name: string; props: Record<string, string> } };

export function transformComponents(content: BuilderContent, mappers: PropsMappers) {
  return traverse(content).map(function (item) {
    if (isBuilderElement(item)) {
      if (item.component) {
        const mapper = mappers[item.component.name];
        if (mapper) {
          this.update({
            ...item,
            ...(item.code?.bindings
              ? {
                  code: {
                    ...item.code,
                    bindings: {
                      ...item.code.bindings,
                      ...Object.keys(mapper.props).reduce((acc, key) => {
                        const binding =
                          item.code!.bindings!![`component.options.${mapper.props[key]}`];
                        if (binding) {
                          return {
                            ...acc,
                            [key]: binding,
                          };
                        }
                        return acc;
                      }, {}),
                    },
                  },
                }
              : {}),
            ...(item.bindings
              ? {
                  bindings: {
                    ...item.bindings,
                    ...Object.keys(mapper.props).reduce((acc, key) => {
                      const binding = item.bindings![`component.options.${mapper.props[key]}`];
                      if (binding) {
                        return {
                          ...acc,
                          [key]: binding,
                        };
                      }
                      return acc;
                    }, {}),
                  },
                }
              : {}),
            component: {
              ...item.component,
              name: mapper.name,
              options: Object.keys(mapper.props).reduce((acc, key) => {
                return {
                  ...acc,
                  [key]: item.component?.options[mapper.props[key]],
                };
              }, {}),
            },
          });
        }
      }
    }
  });
}
