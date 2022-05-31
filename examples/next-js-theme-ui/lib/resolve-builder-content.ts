import { builder } from '@builder.io/react'
import builderConfig from '@config/builder'
builder.init(builderConfig.apiKey)

export async function resolveBuilderContent(
  modelName: string,
  targetingAttributes?: any
) {
  let page = await builder
    .get(modelName, {
      userAttributes: targetingAttributes,
      includeRefs: true,
      cachebust: true,
    } as any)
    .toPromise()

  return page || null
}
