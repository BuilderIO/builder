import { CommerceAPIOperations, registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { searchProductsRequest } from './products-search.query';
import { productRequest } from './product.query';
import { searchCategoriesRequest } from './categories-search.query';
import { categoryRequest } from './category.query';
import pkg from '../package.json';

registerCommercePlugin(
  {
    name: 'VirtoCommerce',
    id: pkg.name,
    settings: [
      {
        name: 'virtoCommerceUrl',
        type: 'string',
        required: true,
      },
      {
        name: 'storeId',
        type: 'string',
        required: true,
      },
      {
        name: 'login',
        type: 'string',
        required: false,
      },
      {
        name: 'password',
        type: 'string',
        required: false,
      },
      {
        name: 'locale',
        type: 'string',
        required: false,
      },
    ],
    ctaText: `Connect your Virto Commerce Store`,
  },
  settings => {
    const basicCache = new Map();

    let virtoCommerceUrl = settings.get('virtoCommerceUrl');
    const storeId = settings.get('storeId');
    const login = settings.get('login');
    const password = settings.get('password');
    const locale = settings.get('locale');

    if (virtoCommerceUrl && virtoCommerceUrl.endsWith('/')) {
      virtoCommerceUrl = virtoCommerceUrl.slice(0, -1);
    }

    const baseUrl = (url: string) => {
      const endUrl = `${virtoCommerceUrl}/${url}`;
      return `https://cdn.builder.io/api/v1/proxy-api?url=${encodeURIComponent(endUrl)}`;
      // return endUrl;
    };

    const auth = async () => {
      if (!headers.Authorization && login && password) {
        const url = baseUrl('/connect/token');
        const body = `grant_type=password&username=${login}&password=${password}`;
        // {
        //     "access_token": "...",
        //     "token_type": "...",
        //     "expires_in": number
        // }
        const token = await fetch(url, { method: 'POST', headers, body })
          .then(x => x.json())
          .then(x => x.access_token);
        headers.Authorization = `Bearer ${token}`;
      }
    };

    const headers = {
      Authorization: <any>null,
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json',
    };

    const transformResource = (resource: any) => ({
      ...resource,
      id: resource.id,
      title: resource.name,
      handle: resource.customUrl?.url,
      image: {
        src: resource.imgSrc,
      },
    });

    const requestData = (request: any) => {
      return fetch(baseUrl('graphql'), {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      }).then(x => x.json());
    };

    const service: CommerceAPIOperations = {
      product: {
        async findById(id: string) {
          await auth();
          const key = `${id}productById`;
          const request = productRequest(storeId, locale, id);
          const product: any =
            basicCache.get(key) ||
            (await requestData(request).then(x => transformResource(x.data.product)));
          console.log(product);
          basicCache.set(key, product);
          return product;
        },

        async search(search: string) {
          await auth();
          const request = searchProductsRequest(storeId, locale, search);
          const response: any = await requestData(request).then(x => x.data.products.items);
          const result = response.map(transformResource);
          console.log(response, result);
          return result;
        },

        // https://github.com/BuilderIO/builder/blob/master/plugins/shopify/src/interfaces/builder-request.ts
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
          await auth();
          const key = `${id}categoryById`;
          const request = categoryRequest(storeId, locale, id);
          const category =
            basicCache.get(key) ||
            (await requestData(request)
              .then(x => x.data.category)
              .then(transformResource));
          basicCache.set(key, category);
          console.log(category);
          return category;
        },

        async search(search: string) {
          await auth();
          const request = searchCategoriesRequest(storeId, locale, search);
          const response: any = await requestData(request).then(x => x.data.categories.items);
          const result = response.map(transformResource);
          console.log(response, result);
          return result;
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
    return service;
  }
);
