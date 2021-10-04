import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { Resource } from '@builder.io/commerce-plugin-tools/dist/types/interfaces/resource';
import pkg from '../package.json';
import appState from '@builder.io/app-context';

registerCommercePlugin(
  {
    name: 'Vtex',
    id: pkg.name,
    settings: [
      {
        name: 'accountName',
        type: 'string',
        helperText: `Get your accountname from your account details in Vtex admin dasbhoard, on (/admin/license-manager/#/account-details) `,
        required: true,
      },
      {
        name: 'secretKey',
        friendlyName: 'Application Secret',
        helperText: `Get your application secret from "{{account name}}.myvtex.com/admin/mykeys" and copy the application secret, or generate a new one if you don't have keys configured `,
        type: 'string',
        required: true,
      },
      {
        name: 'accessKey',
        friendlyName: 'Application Key',
        helperText: `Get your application key from "{{account name}}.myvtex.com/admin/mykeys" and copy the application key, or generate a new one if you don't have keys configured `,
        type: 'string',
        required: true,
      },
    ],
    ctaText: `Connect your Vtex store`,
  },
  settings => {
    const basicCache = new Map();

    const secretKey = settings.get('secretKey');
    const accessKey = settings.get('accessKey');
    const accountName = settings.get('accountName');
    const environment = 'vtexcommercestable';

    const baseUrl = (url: string) => {
      const endUrl = `https://${accountName}.${environment}.com.br/${url}`;
      return `${appState.config.apiRoot()}/api/v1/proxy-api?url=${encodeURIComponent(endUrl)}`;
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
          return response.itemsReturned.map(transformProduct) as Resource[];
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
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

          return categories as Resource[];
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
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
