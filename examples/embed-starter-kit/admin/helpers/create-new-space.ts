import { createAdminApiClient } from '@builder.io/admin-sdk'

export default async function createNewSpace(
  rootPrivateKey: string,
  config: { storeId: string; storeName: string; storeConfig: any }
) {
  const rootAdminSDK = createAdminApiClient(rootPrivateKey)
  const { organization, privateKey } = await rootAdminSDK.chain.mutation
    .createSpace({
      settings: {
        name: config.storeName,
        loadPlugins: [
          'http://localhost:1268/plugin.system.js?pluginId=my-white-labeling-plugin',
        ],
        settings: {
          optimizeContentVisibility: true,
          plugins: {
            'my-white-labeling-plugin': config,
          },
          componentsOnlyMode: true,
          showSitePreviewTab: false,
          allowBuiltInComponents: false,
          reloadPreviewForMobile: true,
        },
        '@version': 6,
        siteUrl: 'http://localhost:3000',
        type: 'space',
      },
    })
    .execute()

  // if successful we'll get the private api key of the new space so we can add new models/contents to it
  // save private key somewhere safe and use it for all communication with admin API (updating settings and creating/updating new models)

  return { publicKey: organization.id, privateKey }
}
