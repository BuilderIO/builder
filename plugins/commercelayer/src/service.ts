type AuthConfig = {
    clientId: string
    scope?: string
}
  
type AuthResponse = {
    accessToken: string
    tokenType: string
    expiresIn: number
    scope: string
    createdAt: number
}

export const authenticateClient = async ({ clientId, scope }: AuthConfig): Promise<AuthResponse> => {
    const authUrl = 'https://auth.commercelayer.io/oauth/token'

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        scope: scope
      })
    })
  
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${errorText}`)
    }
  
    const data = await response.json()
    
    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      scope: data.scope,
      createdAt: data.created_at
    }
  }


/**
 * Make API request directly - Commerce Layer supports CORS
 */
const makeApiRequest = async (
  url: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<any> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

export const getOrganizationInfo = async (accessToken: string) => {
  // Simple base64 decode of JWT payload
  const [, payload] = accessToken.split('.')
  const decodedPayload = JSON.parse(atob(payload))
  
  if ('organization' in decodedPayload) {
    return {
      slug: decodedPayload.organization?.slug,
      baseEndpoint: `https://${decodedPayload.organization?.slug}.commercelayer.io`
    }
  }
  
  throw new Error('Invalid token: no organization found')
}

type Product = {
  id: string
  type: string
  attributes: {
    code: string
    name: string
    description: string
    image_url: string
    // Add other fields we need
  }
  // ... other fields
}

export const getProduct = async (id: string, accessToken: string, baseEndpoint: string): Promise<Product> => {
  const url = `${baseEndpoint}/api/skus/${id}`
  const data = await makeApiRequest(url, accessToken)
  return data.data
}

export const searchProducts = async (search: string, accessToken: string, baseEndpoint: string): Promise<Product[]> => {
    const params = new URLSearchParams({
      'filter[q][name_or_code_cont]': search,
      'page[size]': '25'
    })
  
    const url = `${baseEndpoint}/api/skus?${params}`
    const data = await makeApiRequest(url, accessToken)
    return data.data || []
  }

export const transformProduct = (product: Product) => ({
  id: product.id,
  type: 'product',
  title: product.attributes.name,
  handle: product.attributes.code,
  image: {
    src: product.attributes.image_url
  }
})

export const getProductByHandle = async (handle: string, accessToken: string, baseEndpoint: string): Promise<Product> => {
  const params = new URLSearchParams({
    'filter[q][code_eq]': handle
  })

  const url = `${baseEndpoint}/api/skus?${params}`
  const data = await makeApiRequest(url, accessToken)
  
  if (!data.data?.[0]) {
    throw new Error(`Product not found with handle: ${handle}`)
  }
  
  return data.data[0]
} 