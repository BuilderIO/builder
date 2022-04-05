import { builder, Builder } from '@builder.io/react';

Builder.isStatic = true;

export async function resolveBuilderContent(
  modelName: string,
  targetingAttributes: any,
  cachebust?: boolean
) {
  const cacheOpts = cachebust
    ? {
        cachebust: true,
        noCache: true,
      }
    : {
        staleCacheSeconds: 140,
      };
  const page = await builder
    .get(modelName, {
      userAttributes: targetingAttributes,
      ...cacheOpts,
    })
    .toPromise();

  return page || null;
}
