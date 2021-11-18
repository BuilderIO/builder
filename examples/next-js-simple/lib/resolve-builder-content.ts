import { builder, Builder } from '@builder.io/react'
import builderConfig from '@config/builder'
builder.init(builderConfig.apiKey)

export async function resolveBuilderContent(
  modelName: string,
  targetingAttributes: any,
  cachebust?: boolean
) {
  const content = await builder
    .get(modelName, {
      userAttributes: targetingAttributes,
      ...(cachebust
        ? {
            cachebust: true,
            noCache: true,
          }
        : {
            staleCacheSeconds: 140,
          }),
    })
    .toPromise()

  return content || null
}
