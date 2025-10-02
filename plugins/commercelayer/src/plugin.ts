import { registerCommercePlugin, BuilderRequest, CommerceAPIOperations } from '@builder.io/plugin-tools'
import appState from '@builder.io/app-context'
import pkg from '../package.json'
import { authenticateClient, getOrganizationInfo, getResource, searchResources, getResourceByHandle, transformResource, getValidToken, cachedAuth, CommerceLayerResourceType, RESOURCE_ENDPOINTS } from './service'
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

      const createResourceService = (type: CommerceLayerResourceType) => ({
        async findById(id: string) {
          const token = await getValidToken(clientId, clientSecret, scope)
          const resource = await getResource(type, id, token, baseEndpoint)
          return transformResource(resource, type)
        },
        async findByHandle(handle: string) {
          const token = await getValidToken(clientId, clientSecret, scope)
          const resource = await getResourceByHandle(type, handle, token, baseEndpoint)
          return transformResource(resource, type)
        },

        async search(search: string) {
          const token = await getValidToken(clientId, clientSecret, scope)
          const resources = await searchResources(type, search, token, baseEndpoint)
          return resources.map(res => transformResource(res, type))
        },
        getRequestObject(id: string): BuilderRequest {
          const token = cachedAuth?.token || auth.accessToken
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: `${baseEndpoint}/api/${RESOURCE_ENDPOINTS[type]}/${id}`,
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            },
            options: {
              [type]: id,
              resourceType: type,
              resourceId: id,
              pluginId: pkg.name
            }
          }
        }
      })

      const service = {
        product: createResourceService('product'),
        bundle: createResourceService('bundle')
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

