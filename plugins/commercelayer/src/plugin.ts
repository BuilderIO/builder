import { registerCommercePlugin, BuilderRequest, CommerceAPIOperations } from '@builder.io/plugin-tools'
import appState from '@builder.io/app-context'
import pkg from '../package.json'
import { authenticateClient, getOrganizationInfo, getProduct, searchProducts, getProductByHandle } from './service'

registerCommercePlugin(
{
  name: 'CommerceLayer',
  id: pkg.name,
  settings: [
    {
      name: 'clientId',
      type: 'string',
      required: true,
    },
    {
      name: 'scope',
      type: 'string',
      required: true,
    }
  ],
  ctaText: 'Connect Commerce Layer',
},
  async (settings: any): Promise<CommerceAPIOperations> => {
    try {
      const clientId = settings.get('clientId')
      const scope = settings.get('scope')
      
      const auth = await authenticateClient({ clientId, scope })
      const { baseEndpoint } = await getOrganizationInfo(auth.accessToken)

      return {
        product: {
          async findById(id: string) {
            const product = await getProduct(id, auth.accessToken, baseEndpoint)
            return {
              id: product.id,
              type: 'product',
              title: product.attributes.name,
              handle: product.attributes.code,
              image: {
                src: product.attributes.image_url
              }
            }
          },
          async findByHandle(handle: string) {
            const product = await getProductByHandle(handle, auth.accessToken, baseEndpoint)
            return {
              id: product.id,
              type: 'product',
              title: product.attributes.name,
              handle: product.attributes.code,
              image: {
                src: product.attributes.image_url
              }
            }
          },
          
          async search(search: string) {
            const products = await searchProducts(search, auth.accessToken, baseEndpoint)
            return products.map(product => ({
              id: product.id,
              type: 'product',
              title: product.attributes.name,
              handle: product.attributes.code,
              image: {
                src: product.attributes.image_url
              }
            }))
          },
          getRequestObject(id: string): BuilderRequest {
            return {
              '@type': '@builder.io/core:Request',
              request: {
                url: `${baseEndpoint}/api/skus/${id}`,
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${auth.accessToken}`
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

