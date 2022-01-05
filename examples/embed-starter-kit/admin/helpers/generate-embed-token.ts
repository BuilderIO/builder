import { createAdminApiClient } from '@builder.io/admin-sdk'

export default async function generateEmbedToken(
  rootPrivateKey: string,
  claims: { spaceId: string; domain: string }
) {
  const rootAdminSDK = createAdminApiClient(rootPrivateKey)
  const { token, expires } = await rootAdminSDK.chain.mutation
    .generateEmbedToken({
      claims,
    })
    .execute()

  return { token, expires }
}
