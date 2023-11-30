import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import appState from '@builder.io/app-context';
import { getDataConfig } from './data-plugin';

registerCommercePlugin(
  {
    name: 'BigCommerce',
    id: pkg.name,
    settings: [
      {
        name: 'storeHash',
        type: 'string',
        required: true,
      },
      {
        name: 'accessToken',
        type: 'string',
        required: true,
      },
    ],
    ctaText: `Connect your BigCommerce store`,
  },
  settings => {
    const basicCache = new Map();

    const storeHash = settings.get('storeHash');
    const accessKey = settings.get('accessToken');

    const baseUrl = (url: string) => {
      const endUrl = `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/${url}`;
      return `https://cdn.builder.io/api/v1/proxy-api?url=${encodeURIComponent(endUrl)}`;
    };

    const headers = {
      'X-Auth-Token': accessKey,
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json',
    };

    const transformResource = (resource: any) => ({
      ...resource,
      id: resource.id,
      title: resource.name,
      handle: resource.customUrl?.url,
      image: {
        src: resource.primary_image?.url_thumbnail || resource.image_url,
      },
    });

    const service = {
      product: {
        async findById(id: string) {
          const key = `${id}productById`;
          // https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products/${product_id}
          const product =
            basicCache.get(key) ||
            (await fetch(baseUrl(`products/${id}?include=primary_image`), { headers })
              .then(res => res.json())
              .then(res => res.data)
              .then(transformResource));
          basicCache.set(key, product);
          return product;
        },

        async search(search: string) {
          let queryParams = '?limit=100&include=primary_image';
          queryParams += search ? `&keyword=${search}` : '';
          const response: any = await fetch(baseUrl(`products${queryParams}`), {
            headers,
          }).then(res => {
            return res.json();
          });
          return response.data.map(transformResource);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: baseUrl(`products/${id}`),
              headers,
            },
            options: {
              product: id,
            },
          };
        },
      },
      category: {
        async findById(id: string) {
          const key = `${id}categoryById`;
          const category =
            basicCache.get(key) ||
            (await fetch(baseUrl(`categories/${id}`), { headers })
              .then(res => res.json())
              .then(res => res.data)
              .then(transformResource));
          basicCache.set(key, category);
          return category;
        },

        async search(search: string) {
          let queryParams = '?limit=100';
          queryParams += search ? `&keyword=${search}` : '';
          const response: any = await fetch(baseUrl(`categories${queryParams}`), {
            headers,
          }).then(res => {
            return res.json();
          });
          return response.data.map(transformResource);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: baseUrl(`categories/${id}`),
              headers,
            },
            options: {
              category: id,
            },
          };
        },
      },
    };
    appState.registerDataPlugin(getDataConfig(service, headers));

    return service;
  }
);
