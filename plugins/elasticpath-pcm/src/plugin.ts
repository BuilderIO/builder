import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { gateway } from '@moltin/sdk';
import pkg from '../package.json';

const defaultApiUrl = 'https://api.moltin.com';

registerCommercePlugin(
  {
    name: 'ElasticpathPCM',
    id: pkg.name,
    settings: [
      {
        name: 'clientId',
        type: 'string',
        required: true,
        helperText: 'Get your Client ID from Elasticpath Commerce Manager',
      },
      {
        name: 'clientSecret',
        type: 'string',
        required: true,
        helperText: 'Get your Client Secret from Elasticpath Commerce Manager',
      },
      {
        name: 'apiUrl',
        type: 'string',
        required: true,
        helperText: 'API url to be used, https://api.moltin.com is default',
      },
    ],
    ctaText: `Connect your Elasticpath PCM store`,
  },
  async settings => {
    const clientId = settings.get('clientId')?.trim();
    const clientSecret = settings.get('clientSecret')?.trim();
    const finalApiUrl = settings.get('apiURL')?.trim() || defaultApiUrl;

    const elasticpathApi = gateway({
      client_id: clientId,
      client_secret: clientSecret,
      host: new URL(finalApiUrl).host,
    });

    const transformPCMProduct = (resource: any) => {
      return {
        id: resource.id,
        title: resource.attributes.name,
        handle: resource.attributes.slug,
        ...(resource.attributes?.extensions?.['products(extension)'] && {
          image: {
            src: resource.attributes.extensions['products(extension)'].image_1,
          },
        }),
      };
    };

    const token = await elasticpathApi.Authenticate().then(value => value.access_token);

    return {
      heirarchy: {
        async findById(id: string) {
          const heirarchy = await elasticpathApi.Hierarchies.Get(id);
          return transformPCMProduct(heirarchy.data);
        },
        async findByHandle(handle: string) {
          const response = await elasticpathApi.Hierarchies.Filter({
            eq: {
              slug: handle,
            },
          }).All();
          return response.data[0] && transformPCMProduct(response.data[0]);
        },
        async search(search: string) {
          const response = await elasticpathApi.Hierarchies.Filter({
            ...(search && {
              like: {
                name: search,
              },
            }),
            // TODO: pagination if needed
          }).All();
          return response.data.map(transformPCMProduct);
        },

        getRequestObject(id: string) {
          // TODO
          return {
            '@type': '@builder.io/core:Request',
            request: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              url: `${finalApiUrl}/pcm/hierarchies/${id}`,
            },
            options: {
              heirarchy: id,
            },
          };
        },
      },
      product: {
        async findById(id: string) {
          const product = await elasticpathApi.PCM.Get(id);
          return transformPCMProduct(product.data);
        },
        async findByHandle(handle: string) {
          const response = await elasticpathApi.PCM.Filter({
            eq: {
              slug: handle,
            },
          }).All();
          return response.data[0] && transformPCMProduct(response.data[0]);
        },
        async search(search: string) {
          const response = await elasticpathApi.PCM.Filter({
            ...(search && {
              like: {
                name: search,
              },
            }),
            // TODO: pagination if needed
          }).All();
          return response.data.map(transformPCMProduct);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              url: `${finalApiUrl}/pcm/products/${id}`,
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
