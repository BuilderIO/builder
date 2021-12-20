import { createAdminApiClient } from '@builder.io/admin-sdk'
import * as schemas from '../constants/schemas'

export default async function addNewModel(
  spacePrivateKey: string,
  modelName: keyof typeof schemas
) {
  const spaceAdminSDK = createAdminApiClient(spacePrivateKey)
  const modelSchema = schemas[modelName]

  const model = await spaceAdminSDK.chain.mutation
    .addModel({ body: modelSchema })
    .execute({ id: true })

  if (!model) {
    throw new Error('model not created')
  }
  return model
}
