import { builder, Builder } from '@builder.io/react'
import { getAsyncProps } from '@builder.io/utils'
import builderConfig from '@config/builder'

builder.init(builderConfig.apiKey)
Builder.isStatic = true

export async function resolveBuilderContent(
  modelName: string,
  targetingAttributes?: any
) {
  return await builder
    .get(modelName, {
      userAttributes: targetingAttributes,
      includeRefs: true,
      preview: modelName,
      cachebust: true,
    } as any)
    .toPromise() || null;
}
