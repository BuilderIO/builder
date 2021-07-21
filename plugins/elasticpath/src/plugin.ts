import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { gateway } from '@moltin/sdk'
import pkg from '../package.json'

registerCommercePlugin(
  {
    name: 'Elasticpath',
    id: pkg.name,
    settings: [
      {
        name: 'clientId',
        type: 'string',
        required: true,
        helperText:
          'Get your Client ID from Elasticpath dashboard // todo add link ',
      },
    ],
    ctaText: `Connect your Elasticpath store`,
  },
  settings => {
    const clientId = settings.get('clientId')?.trim();
    const elasticpathApi = gateway({
      client_id: clientId,
    })
    
    const transformResource = (resource: any) => ({
      id: resource.id,
      title: resource.name,
      handle: resource.slug,
      ...(resource.images && {
        image: {
          src: resource.images[0]?.file.url,
        },
      }),
    });

    let token = '';
    elasticpathApi.Authenticate().then(value => {
      token = value.access_token;
    });

    return {
      product: {
        async findById(id: string) {
          const product = await elasticpathApi.Products.Get(id);
          return transformResource(product.data);
        },
        // TODO: figure out how to get a product by a slug
        async findByHandle(handle: string) {
          const response = await elasticpathApi.Products.Filter({
            eq: {
              slug: handle
            },
            // TODO: pagination if needed
          }).All();
          return response.data[0] && transformResource(response.data[0]);
        },
        async search(search: string) {
          const response = await elasticpathApi.Products.Filter({
            ...(search && {like: {
              name: search
            }}),
            // TODO: pagination if needed
          }).All();
          return response.data.map(transformResource);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              // TODO: figure out public url for resource from elasticpath
              url: `https://api.moltin.com/v2/products/${id}`,
            },
            options: {
              product: id,
            },
          };
        },
      },
    };
  }
);
