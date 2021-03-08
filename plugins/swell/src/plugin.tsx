import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';

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
        name: 'secretKey',
        type: 'string',
        required: true,
        helperText:
          'Get your Secret key from swell store settings https://swell.store/docs/api/?javascript#authentication',
      },
    ],
    ctaText: `Connect your swell.is store`,
    onSave: async actions =>
      await actions.updateSettings({
        hasConnected: true,
      }),
  },
  settings => {
    const basicCache = new Map();

    const baseUrl = (url: string) =>
      'https://builder.io/api/v1/proxy-api?url=' +
      encodeURIComponent('https://api.swell.store/' + url);
    const headers = {
      Authorization: `Basic ${btoa(`${settings.get('storeId')}:${settings.get('secretKey')}`)}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const transformProduct = (product: any) => ({
      id: product.id,
      title: product.name,
      handle: product.slug,
      ...(product.images && {
        image: {
          src: product.images[0]?.file.url,
        },
      }),
    });

    return {
      product: {
        async findById(id: string) {
          const key = `${id}productById`;
          const product =
            basicCache.get(key) ||
            (await fetch(baseUrl(`products/${id}`), { headers })
              .then(res => res.json())
              .then(transformProduct));
          basicCache.set(key, product);
          return product;
        },
        async findByHandle(handle: string) {
          const key = `${handle}productByHandle`;
          const response =
            basicCache.get(key) ||
            (await fetch(baseUrl(`products?where[active]=true&where[slug]=${handle}`), {
              headers,
            }).then(res => res.json()));
          basicCache.set(key, response);
          const product = response.results.map(transformProduct)[0];
          return product;
        },
        async search(search: string) {
          const response = await fetch(baseUrl(`products?where[active]=true&search=${search}`), {
            headers,
          }).then(res => res.json());
          return response.results.map(transformProduct);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: baseUrl(`products/${id}`),
            },
            options: {
              product: id,
            },
          };
        },
      },
      category: {
        async findById(id: string) {
          const key = `${id}collectionById`;
          const collection =
            basicCache.get(key) ||
            (await fetch(baseUrl(`categories/${id}`), { headers })
              .then(res => res.json())
              .then(transformProduct));
          basicCache.set(key, collection);
          return collection;
        },
        async findByHandle(handle: string) {
          const key = `${handle}collectionByHandle`;
          const response =
            basicCache.get(key) ||
            (await fetch(baseUrl(`categories?where[active]=true&where[slug]=${handle}`), {
              headers,
            }).then(res => res.json()));
          basicCache.set(key, response);
          const collection = response.results.map(transformProduct)[0];
          return collection;
        },
        async search(search: string) {
          const response = await fetch(baseUrl(`categories?where[active]=true&search=${search}`), {
            headers,
          }).then(res => res.json());
          return response.results.map(transformProduct);
        },
        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: baseUrl(`categories/${id}`),
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
