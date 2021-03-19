import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import swell from 'swell-js';

registerCommercePlugin(
  {
    name: 'Swell',
    // should always match package.json package name
    id: '@builder.io/plugin-swell',
    settings: [
      {
        name: 'storeId',
        type: 'string',
        required: true,
        helperText:
          'Get your Store ID from swell store settings https://swell.store/docs/api/?javascript#authentication',
      },
      {
        name: 'publicKey',
        type: 'string',
        required: true,
        helperText:
          'Get your Public key from swell store settings > API keys > Public api key https://swell.store/docs/api/?javascript#authentication',
      },
    ],
    ctaText: `Connect your swell.is store`,
  },
  settings => {
    const storeId = settings.get('storeId')?.trim();
    const publicKey = settings.get('publicKey')?.trim();
    swell.init(storeId, publicKey);

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

    return {
      product: {
        async findById(id: string) {
          const product = await swell.products.get(id);
          return transformResource(product);
        },
        async findByHandle(handle: string) {
          const product = await swell.products.get(handle);
          return transformResource(product);
        },
        async search(search: string) {
          const response = await swell.products.list({
            search,
            // TODO: pagination if needed
            limit: 100,
            page: 1,
          });
          return response.results.map(transformResource);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              // https://{public_key}@{client_id}.swell.store/api/products/5e31e67be53f9a59d89600f1.
              url: `https://${publicKey}@${storeId}.swell.store/api/products/${id}`,
            },
            options: {
              product: id,
            },
          };
        },
      },
      category: {
        async findById(id: string) {
          const category = await swell.categories.get(id);
          return transformResource(category);
        },
        async findByHandle(handle: string) {
          const category = await swell.categories.get(handle);
          return transformResource(category);
        },
        async search(search: string) {
          const response = await swell.categories.list({
            search,
            // TODO: pagination if needed
            limit: 100,
            page: 1,
          });
          return response.results.map(transformResource);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              // https://{public_key}@{client_id}.swell.store/api/categories/5e31e67be53f9a59d89600f1.
              url: `https://${publicKey}@${storeId}.swell.store/api/categories/${id}`,
            },
            options: {
              category: id,
            },
          };
        },
      },
    };
  }
);
