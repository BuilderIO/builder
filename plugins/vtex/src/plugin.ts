import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';

registerCommercePlugin(
  {
    name: 'Vtex',
    id: pkg.name,
    settings: [
      {
        name: 'accountName',
        type: 'string',
        required: true,
      },
      {
        name: 'secretKey',
        type: 'string',
        required: true,
      },
      {
        name: 'accessKey',
        type: 'string',
        required: true,
      },
      ,
      {
        name: 'environment',
        type: 'string',
        required: true,
        defaultValue: 'vtexcommercestable',
      },
    ],
    ctaText: `Connect your Vtex store`,
  },
  settings => {
    const basicCache = new Map();

    const secretKey = settings.get('secretKey');
    const accessKey = settings.get('accessKey');
    const accountName = settings.get('accountName');
    const isDev = settings.get('environment') === 'development';
    const environment = 'vtexcommercestable';

    const baseUrl = (url: string) => {
      const endUrl = `https://${accountName}.${environment}.com.br/${url}`;
      return `${
        isDev ? 'http://localhost:5000' : 'https://builder.io'
      }/api/v1/proxy-api?url=${encodeURIComponent(endUrl)}`;
    };

    const headers = {
      'X-VTEX-API-AppToken': secretKey,
      'X-VTEX-API-AppKey': accessKey,
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json',
    };

    const transformProduct = (product: any) => ({
      ...product,
      id: product.Id || product.id || product.productId || product.items?.[0]?.productId,
      title: product.name || product.Name || product.productName,
      handle:
        product.linkText || product.items?.[0]?.linkText || product.href?.split('/').reverse()[1],
      ...(product.images && {
        image: {
          src: product.images[0]?.imageUrl,
        },
      }),
      ...(product.thumbUrl && {
        image: {
          src: product.thumbUrl,
        },
      }),
    });

    const service = {
      product: {
        async findById(id: string) {
          const key = `${id}productById`;
          // https://{accountName}.{environment}.com.br/api/catalog/pvt/product/productId
          const product =
            basicCache.get(key) ||
            (await fetch(baseUrl(`api/catalog/pvt/product/${id}`), { headers })
              .then(res => res.json())
              .then(transformProduct));
          basicCache.set(key, product);
          return product;
        },

        async findByHandle(handle: string) {
          const response = await fetch(
            baseUrl(`api/catalog_system/pub/products/search/${handle}/p`),
            {
              headers,
            }
          ).then(res => res.json());
          const product = response.map(transformProduct)[0];
          return product;
        },
        async search(search: string) {
          const response: any = await fetch(
            baseUrl(`/buscaautocomplete?productNameContains=${search}`),
            {
              headers,
            }
          ).then(res => {
            return res.json();
          });
          return response.itemsReturned.map(transformProduct);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: baseUrl(`api/catalog/pvt/product/${id}`),
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
          // https://{accountName}.{environment}.com.br/api/catalog/pvt/category/categoryId
          const category =
            basicCache.get(key) ||
            (await fetch(baseUrl(`api/catalog/pvt/category/${id}`), { headers })
              .then(res => res.json())
              .then(transformProduct));
          basicCache.set(key, category);
          return category;
        },

        async findByHandle(handle: string) {
          const response = await fetch(
            baseUrl(`api/catalog_system/pub/categories/search/${handle}/p`),
            {
              headers,
            }
          ).then(res => res.json());
          const category = response.map(transformProduct)[0];
          return category;
        },
        async search(search: string) {
          const response: any = await fetch(
            baseUrl(`/buscaautocomplete?categoryNameContains=${search}`),
            {
              headers,
            }
          ).then(res => {
            return res.json();
          });

          // TODO: figure out how to search without this hack
          const categories = await Promise.all(
            response.itemsReturned.map(async (item: any) => {
              const product = await service.product.findById(item.items[0].productId);
              return await service.category.findById(product.CategoryId);
            })
          );

          return categories;
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: baseUrl(`api/catalog/pvt/category/${id}`),
              headers,
            },
            options: {
              category: id,
            },
          };
        },
      },
    };
    return service;
  }
);
