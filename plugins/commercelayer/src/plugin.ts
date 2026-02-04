import { registerCommercePlugin, BuilderRequest, CommerceAPIOperations } from '@builder.io/plugin-tools'
import appState from '@builder.io/app-context'
import pkg from '../package.json'
import { authenticateClient, getOrganizationInfo, getProduct, searchProducts, getProductByHandle, transformProduct, getValidToken, cachedAuth } from './service'
import { getDataConfig } from './data-plugin'

registerCommercePlugin(
{
  name: 'CommerceLayer',
  id: pkg.name,
  settings: [
    {
      name: 'clientId',
      type: 'string',
      required: true,
      helperText: 'Your Commerce Layer application Client ID'
    },
    {
      name: 'clientSecret',
      type: 'string',
      required: false,
      helperText: 'Your Commerce Layer Client Secret (required for integration tokens to access all markets)'
    },
    {
      name: 'scope',
      type: 'string',
      required: true,
      helperText: 'Commerce Layer scope (e.g., "market:all" for integrations, "market:id:YOUR_MARKET_ID" for sales channels)'
    }
  ],
  ctaText: 'Connect your Commerce Layer store',
},
  async (settings: any): Promise<CommerceAPIOperations> => {
    try {
      const clientId = settings.get('clientId')
      const clientSecret = settings.get('clientSecret')
      const scope = settings.get('scope')
      
      // Get auth and organization info
      const auth = await authenticateClient({ clientId, clientSecret, scope })
      const { baseEndpoint } = await getOrganizationInfo(auth.accessToken)

      const service = {
        product: {
          async findById(id: string) {
            const token = await getValidToken(clientId, clientSecret, scope)
            const product = await getProduct(id, token, baseEndpoint)
            return transformProduct(product)
          },
          async findByHandle(handle: string) {
            const token = await getValidToken(clientId, clientSecret, scope)
            const product = await getProductByHandle(handle, token, baseEndpoint)
            return transformProduct(product)
          },
          
          async search(search: string) {
            const token = await getValidToken(clientId, clientSecret, scope)
            const products = await searchProducts(search, token, baseEndpoint)
            return products.map(transformProduct)
          },
          getRequestObject(id: string): BuilderRequest {
            // Note: getRequestObject must be synchronous, so we use the cached token
            // The token will be refreshed automatically on the next API call if needed
            const token = cachedAuth?.token || auth.accessToken
            return {
              '@type': '@builder.io/core:Request',
              request: {
                url: `${baseEndpoint}/api/skus/${id}`,
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              },
              options: {
                product: id,
                pluginId: pkg.name
              }
            }
          }
        }
      }

      // Register the data plugin for "Connect Data" functionality
      appState.registerDataPlugin(getDataConfig(service as any, baseEndpoint, auth.accessToken))

      return service
    } catch (error) {
      console.error(error)
      appState.snackBar.show(
        `Error connecting to Commerce Layer, check console for details`,
        15000
      )
      throw error
    }
  }
)

